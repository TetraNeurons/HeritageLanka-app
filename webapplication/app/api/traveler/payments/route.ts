import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { payments, trips, travelers, events } from '@/db/schema';
import { eq, desc, or } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get traveler for authenticated user
    const [traveler] = await db
      .select()
      .from(travelers)
      .where(eq(travelers.userId, session.userId))
      .limit(1);

    if (!traveler) {
      return NextResponse.json(
        { success: false, error: 'Traveler profile not found' },
        { status: 404 }
      );
    }

    // Query trip payments for authenticated traveler
    const tripPayments = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        status: payments.status,
        paidAt: payments.paidAt,
        createdAt: payments.createdAt,
        tripId: payments.tripId,
        eventId: payments.eventId,
        ticketQuantity: payments.ticketQuantity,
        tripFromDate: trips.fromDate,
        tripToDate: trips.toDate,
        tripCountry: trips.country,
        tripStatus: trips.status,
        numberOfPeople: trips.numberOfPeople,
        totalDistance: trips.totalDistance,
      })
      .from(payments)
      .innerJoin(trips, eq(payments.tripId, trips.id))
      .where(eq(trips.travelerId, traveler.id))
      .orderBy(desc(payments.createdAt));

    // Query event payments for authenticated traveler
    const eventPayments = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        status: payments.status,
        paidAt: payments.paidAt,
        createdAt: payments.createdAt,
        tripId: payments.tripId,
        eventId: payments.eventId,
        ticketQuantity: payments.ticketQuantity,
        eventTitle: events.title,
        eventDate: events.date,
        eventPlace: events.place,
      })
      .from(payments)
      .innerJoin(events, eq(payments.eventId, events.id))
      .where(eq(payments.travelerId, traveler.id))
      .orderBy(desc(payments.createdAt));

    // Format trip payments
    const formattedTripPayments = tripPayments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      type: 'trip' as const,
      trip: {
        id: payment.tripId,
        fromDate: payment.tripFromDate,
        toDate: payment.tripToDate,
        country: payment.tripCountry,
        status: payment.tripStatus,
        numberOfPeople: payment.numberOfPeople,
        totalDistance: payment.totalDistance,
      },
    }));

    // Format event payments
    const formattedEventPayments = eventPayments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      type: 'event' as const,
      event: {
        id: payment.eventId,
        title: payment.eventTitle,
        date: payment.eventDate,
        place: payment.eventPlace,
        ticketQuantity: payment.ticketQuantity,
      },
    }));

    // Combine and sort all payments by creation date
    const allPayments = [...formattedTripPayments, ...formattedEventPayments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(
      {
        success: true,
        payments: allPayments,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get payment history error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
