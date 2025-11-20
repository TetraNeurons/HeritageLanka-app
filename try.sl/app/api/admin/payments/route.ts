import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { payments, trips, travelers, users, events } from '@/db/schema';
import { eq, and, gte, lte, desc, isNotNull, or } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and ADMIN role
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const typeFilter = searchParams.get('type'); // 'trip', 'event', or null for all
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Build query conditions
    const conditions = [];
    
    // Support status filter query parameter
    if (statusFilter) {
      conditions.push(eq(payments.status, statusFilter as any));
    }

    // Support type filter
    if (typeFilter === 'event') {
      conditions.push(isNotNull(payments.eventId));
    } else if (typeFilter === 'trip') {
      conditions.push(isNotNull(payments.tripId));
    }

    // Support date range filters (fromDate, toDate)
    if (fromDate) {
      conditions.push(gte(payments.createdAt, new Date(fromDate)));
    }
    if (toDate) {
      conditions.push(lte(payments.createdAt, new Date(toDate)));
    }

    // Get all payments
    const allPaymentsData = await db
      .select()
      .from(payments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(payments.createdAt));

    // Format payments with trip or event details
    const formattedPayments = await Promise.all(
      allPaymentsData.map(async (payment) => {
        // Get traveler info
        const [travelerData] = await db
          .select({
            travelerId: travelers.id,
            travelerName: users.name,
            travelerEmail: users.email,
          })
          .from(travelers)
          .innerJoin(users, eq(travelers.userId, users.id))
          .where(eq(travelers.id, payment.travelerId!))
          .limit(1);

        const basePayment = {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
          traveler: travelerData ? {
            id: travelerData.travelerId,
            name: travelerData.travelerName,
            email: travelerData.travelerEmail,
          } : null,
        };

        // If trip payment
        if (payment.tripId) {
          const [tripData] = await db
            .select()
            .from(trips)
            .where(eq(trips.id, payment.tripId))
            .limit(1);

          return {
            ...basePayment,
            type: 'trip' as const,
            trip: tripData ? {
              id: tripData.id,
              fromDate: tripData.fromDate,
              toDate: tripData.toDate,
              country: tripData.country,
              status: tripData.status,
              numberOfPeople: tripData.numberOfPeople,
              totalDistance: tripData.totalDistance,
            } : null,
          };
        }

        // If event payment
        if (payment.eventId) {
          const [eventData] = await db
            .select()
            .from(events)
            .where(eq(events.id, payment.eventId))
            .limit(1);

          return {
            ...basePayment,
            type: 'event' as const,
            event: eventData ? {
              id: eventData.id,
              title: eventData.title,
              date: eventData.date,
              place: eventData.place,
            } : null,
            ticketQuantity: payment.ticketQuantity,
          };
        }

        return basePayment;
      })
    );

    return NextResponse.json(
      {
        success: true,
        payments: formattedPayments,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get admin payments error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
