import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { events } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const event = await db.select().from(events).where(eq(events.id, params.id)).limit(1);
    
    if (!event.length) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { title, images, date, price, place, lat, lng, phone, organizer, description, ticketCount } = body;

    const updated = await db.update(events)
      .set({
        title,
        images,
        date,
        price,
        place,
        lat,
        lng,
        phone,
        organizer,
        description,
        ticketCount,
        updatedAt: new Date(),
      })
      .where(eq(events.id, params.id))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await db.delete(events).where(eq(events.id, params.id)).returning();

    if (!deleted.length) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}