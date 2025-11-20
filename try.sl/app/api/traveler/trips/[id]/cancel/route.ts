import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { trips, travelers, guides } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tripId } = await params;

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

    // Verify trip belongs to authenticated traveler
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

    // Check trip can be cancelled (not already COMPLETED or CANCELLED)
    if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot cancel trip with status ${trip.status}.`,
        },
        { status: 400 }
      );
    }

    // Use transaction to update trip, traveler, and guide atomically
    await db.transaction(async (tx) => {
      // Update trip status to CANCELLED
      await tx
        .update(trips)
        .set({
          status: 'CANCELLED',
          bookingStatus: 'CANCELLED',
          updatedAt: new Date(),
        })
        .where(eq(trips.id, tripId));

      // If trip was IN_PROGRESS, reset traveler.tripInProgress to false
      if (trip.status === 'IN_PROGRESS') {
        await tx
          .update(travelers)
          .set({ tripInProgress: false })
          .where(eq(travelers.id, traveler.id));

        // If trip has a guide, update guide.tripInProgress to false
        if (trip.guideId) {
          await tx
            .update(guides)
            .set({ tripInProgress: false })
            .where(eq(guides.id, trip.guideId));
        }
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Trip cancelled successfully',
        tripId: tripId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Cancel trip error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
