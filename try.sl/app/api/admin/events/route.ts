import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { events } from '@/db/schema';

export async function GET() {
  try {
    const allEvents = await db.select().from(events).orderBy(events.createdAt);
    return NextResponse.json(allEvents);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, images, date, price, place, lat, lng, phone, organizer, description, ticketCount } = body;

    const newEvent = await db.insert(events).values({
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
      ticketCount: ticketCount || 0,
    }).returning();

    return NextResponse.json(newEvent[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}