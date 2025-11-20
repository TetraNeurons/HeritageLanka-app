import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { trips, guides } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tripId } = await params;

    // Authenticate and verify guide role
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.role !== 'GUIDE') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Guide role required' },
        { status: 403 }
      );
    }

    // Get guide profile for authenticated user
    const [guide] = await db
      .select()
      .from(guides)
      .where(eq(guides.userId, session.userId))
      .limit(1);

    if (!guide) {
      return NextResponse.json(
        { success: false, error: 'Guide profile not found' },
        { status: 404 }
      );
    }

    // Verify guide doesn't have tripInProgress = true
    if (guide.tripInProgress) {
      return NextResponse.json(
        { success: false, error: 'Cannot accept trip - you already have a trip in progress' },
        { status: 409 }
      );
    }

    // Use transaction for atomicity
    const result = await db.transaction(async (tx) => {
      // Get and verify trip is still in PLANNING status and not assigned
      const [trip] = await tx
        .select()
        .from(trips)
        .where(
          and(
            eq(trips.id, tripId),
            eq(trips.status, 'PLANNING'),
            isNull(trips.guideId)
          )
        )
        .limit(1);

      if (!trip) {
        throw new Error('Trip not found, already assigned, or not in PLANNING status');
      }

      // Update trip: assign guide, change status to CONFIRMED, update bookingStatus
      await tx
        .update(trips)
        .set({
          guideId: guide.id,
          status: 'CONFIRMED',
          bookingStatus: 'ACCEPTED',
          updatedAt: new Date(),
        })
        .where(eq(trips.id, tripId));

      // Update guide tripInProgress flag
      await tx
        .update(guides)
        .set({
          tripInProgress: true,
        })
        .where(eq(guides.id, guide.id));

      return { success: true };
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Trip accepted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Accept trip error:', error);
    
    // Handle specific error cases
    if (error.message.includes('Trip not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
