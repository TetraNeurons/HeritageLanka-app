import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { trips, guides } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';
import { canGuideAcceptTrips, getGuideVerificationStatus } from '@/lib/verification-service';

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

    // Check guide verification status
    const canAccept = await canGuideAcceptTrips(guide.id);
    if (!canAccept) {
      const verificationStatus = await getGuideVerificationStatus(guide.id);
      
      if (verificationStatus.status === 'PENDING') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Your account is pending verification. You will be able to accept trips once verified.',
            verificationStatus: 'PENDING'
          },
          { status: 403 }
        );
      } else if (verificationStatus.status === 'REJECTED') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Your account verification was rejected. Please contact support for more information.',
            verificationStatus: 'REJECTED',
            rejectionReason: verificationStatus.rejectionReason
          },
          { status: 403 }
        );
      }
    }

    // Verify guide doesn't have tripInProgress = true
    if (guide.tripInProgress) {
      return NextResponse.json(
        { success: false, error: 'Cannot accept trip - you already have a trip in progress' },
        { status: 409 }
      );
    }

    // Get and verify trip is still in PLANNING status and not assigned
    const [trip] = await db
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
      return NextResponse.json(
        { success: false, error: 'Trip not found, already assigned, or not in PLANNING status' },
        { status: 409 }
      );
    }

    // Update trip: assign guide, change status to CONFIRMED, update bookingStatus
    await db
      .update(trips)
      .set({
        guideId: guide.id,
        status: 'CONFIRMED',
        bookingStatus: 'ACCEPTED',
        updatedAt: new Date(),
      })
      .where(eq(trips.id, tripId));

    // Update guide tripInProgress flag
    await db
      .update(guides)
      .set({
        tripInProgress: true,
      })
      .where(eq(guides.id, guide.id));

    return NextResponse.json(
      {
        success: true,
        message: 'Trip accepted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Accept trip error:', error);

    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
