import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { eventTickets, events, travelers } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

    // Get all tickets purchased by this traveler with event details
    const tickets = await db
      .select({
        ticketId: eventTickets.id,
        quantity: eventTickets.quantity,
        purchasedAt: eventTickets.purchasedAt,
        event: {
          id: events.id,
          title: events.title,
          images: events.images,
          date: events.date,
          price: events.price,
          place: events.place,
          lat: events.lat,
          lng: events.lng,
          phone: events.phone,
          organizer: events.organizer,
          description: events.description,
          ticketCount: events.ticketCount,
        },
      })
      .from(eventTickets)
      .innerJoin(events, eq(eventTickets.eventId, events.id))
      .where(eq(eventTickets.travelerId, traveler.id))
      .orderBy(eventTickets.purchasedAt);

    // Transform to match EventItem format
    const myTickets = tickets.map((ticket) => ({
      ...ticket.event,
      purchasedQuantity: ticket.quantity,
      purchasedAt: ticket.purchasedAt.toISOString(),
      ticketId: ticket.ticketId,
    }));

    return NextResponse.json(myTickets);
  } catch (error: any) {
    console.error('Fetch my tickets error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}
