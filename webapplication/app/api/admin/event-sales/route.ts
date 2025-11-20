import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { events, payments, travelers, users } from '@/db/schema';
import { eq, and, isNotNull, sql } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Authenticate and verify admin role
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin role required' },
        { status: 403 }
      );
    }

    // Get all events
    const allEvents = await db.select().from(events);

    // Get all event payments with traveler info
    const eventPayments = await db
      .select({
        payment: payments,
        event: events,
        traveler: travelers,
        travelerUser: users,
      })
      .from(payments)
      .innerJoin(events, eq(payments.eventId, events.id))
      .innerJoin(travelers, eq(payments.travelerId, travelers.id))
      .innerJoin(users, eq(travelers.userId, users.id))
      .where(
        and(
          isNotNull(payments.eventId),
          eq(payments.status, 'PAID')
        )
      );

    // Aggregate sales data by event
    const salesByEvent = allEvents.map((event) => {
      const eventPurchases = eventPayments.filter(
        (p) => p.event.id === event.id
      );

      const totalTicketsSold = eventPurchases.reduce(
        (sum, p) => sum + (p.payment.ticketQuantity || 0),
        0
      );

      const revenue = eventPurchases.reduce(
        (sum, p) => sum + p.payment.amount,
        0
      );

      const purchases = eventPurchases.map((p) => ({
        travelerName: p.travelerUser.name,
        quantity: p.payment.ticketQuantity || 0,
        amount: p.payment.amount,
        purchaseDate: p.payment.paidAt?.toISOString() || p.payment.createdAt.toISOString(),
      }));

      return {
        eventId: event.id,
        eventName: event.title,
        totalTicketsSold,
        remainingTickets: event.ticketCount,
        revenue,
        purchases,
      };
    });

    return NextResponse.json(
      {
        success: true,
        sales: salesByEvent,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get event sales error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
