import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { tripVerifications, trips, guides } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';
import geohash from 'ngeohash';

export async function POST(
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
    
    // Get OTP and location from request body
    const body = await request.json();
    const { otp, latitude, longitude } = body;
    
    if (!otp || !latitude || !longitude) {
      return NextResponse.json(
        { success: false, error: 'OTP and location coordinates are required' },
        { status: 400 }
      );
    }

    // Get guide for authenticated user
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

    // Verify trip belongs to this guide
    const [trip] = await db
      .select()
      .from(trips)
      .where(and(eq(trips.id, tripId), eq(trips.guideId, guide.id)))
      .limit(1);

    if (!trip) {
      return NextResponse.json(
        { success: false, error: 'Trip not found or does not belong to you' },
        { status: 404 }
      );
    }

    // Get verification record
    const [verification] = await db
      .select()
      .from(tripVerifications)
      .where(eq(tripVerifications.tripId, tripId))
      .limit(1);

    if (!verification) {
      return NextResponse.json(
        { success: false, error: 'Verification record not found' },
        { status: 404 }
      );
    }

    // Check if OTP has expired
    if (new Date() > verification.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please ask the traveler to restart the trip.' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (verification.verified) {
      return NextResponse.json(
        { success: false, error: 'Trip has already been verified' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (verification.otp !== otp) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP. Please check and try again.' },
        { status: 400 }
      );
    }

    // Generate guide geohash with precision 5
    const guideGeohash = geohash.encode(latitude, longitude, 5);

    // Check if geohashes match (same 5-character prefix means within ~5km)
    if (verification.travelerGeohash !== guideGeohash) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Location verification failed. You must be near the traveler to start the trip.',
          travelerGeohash: verification.travelerGeohash,
          guideGeohash: guideGeohash,
        },
        { status: 400 }
      );
    }

    // Update verification record
    await db
      .update(tripVerifications)
      .set({
        guideGeohash,
        verified: true,
        verifiedAt: new Date(),
      })
      .where(eq(tripVerifications.tripId, tripId));

    return NextResponse.json(
      {
        success: true,
        message: 'Trip verified successfully! You can now start guiding.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
