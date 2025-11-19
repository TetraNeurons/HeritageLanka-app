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