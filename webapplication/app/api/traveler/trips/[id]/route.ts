import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { trips, travelers, tripLocations, payments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: tripId } = await params;

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

    // Verify trip belongs to authenticated traveler and get trip details
    const [trip] = await db
      .select()
      .from(trips)
      .where(and(eq(trips.id, tripId), eq(trips.travelerId, traveler.id)))
      .limit(1);

    if (!trip) {
      return NextResponse.json(
        { success: false, error: 'Trip not found or does not belong to you' },
        { status: 404 }
      );
    }

    // Check trip status is PLANNING or CONFIRMED
    if (trip.status !== 'PLANNING' && trip.status !== 'CONFIRMED') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete trip with status ${trip.status}. Only trips with status PLANNING or CONFIRMED can be deleted.`,
        },
        { status: 400 }
      );
    }

    // Delete trip with cascade to tripLocations and payments
    // The database schema has onDelete: 'cascade' configured, so related records will be automatically deleted
    await db.delete(trips).where(eq(trips.id, tripId));

    // Update traveler.tripInProgress flag if necessary
    // Check if traveler has any remaining IN_PROGRESS trips
    const [remainingInProgressTrip] = await db
      .select()
      .from(trips)
      .where(and(eq(trips.travelerId, traveler.id), eq(trips.status, 'IN_PROGRESS')))
      .limit(1);

    if (!remainingInProgressTrip && traveler.tripInProgress) {
      await db
        .update(travelers)
        .set({ tripInProgress: false })
        .where(eq(travelers.id, traveler.id));
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Trip deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete trip error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
