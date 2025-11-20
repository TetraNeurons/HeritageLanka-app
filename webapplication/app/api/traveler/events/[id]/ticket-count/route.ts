import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { events } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { ticketCount } = body;

    if (typeof ticketCount !== 'number') {
      return NextResponse.json({ error: 'Invalid ticket count' }, { status: 400 });
    }

    const updated = await db.update(events)
      .set({
        ticketCount,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update ticket count' }, { status: 500 });
  }
}