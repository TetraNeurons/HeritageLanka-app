import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { trips, travelers, payments, guides, users, tripVerifications } from '@/db/schema';
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
    
    // Get latitude and longitude from request body
    const body = await request.json();
    const { latitude, longitude } = body;
    
    if (!latitude || !longitude) {
      return NextResponse.json(
        { success: false, error: 'Location coordinates are required' },
        { status: 400 }
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

    // Check trip status is CONFIRMED
    if (trip.status !== 'CONFIRMED') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot start trip with status ${trip.status}. Trip must be CONFIRMED.`,
        },
        { status: 400 }
      );
    }

    // Verify payment exists and status is PAID
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.tripId, tripId))
      .limit(1);

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment not found. Please complete payment before starting the trip.',
        },
        { status: 400 }
      );
    }

    if (payment.status !== 'PAID') {
      return NextResponse.json(
        {
          success: false,
          error: `Payment status is ${payment.status}. Trip can only be started after payment is completed.`,
        },
        { status: 400 }
      );
    }

    // Check traveler has no other IN_PROGRESS trips
    const [existingInProgressTrip] = await db
      .select()
      .from(trips)
      .where(
        and(
          eq(trips.travelerId, traveler.id),
          eq(trips.status, 'IN_PROGRESS')
        )
      )
      .limit(1);

    if (existingInProgressTrip) {
      return NextResponse.json(
        {
          success: false,
          error: 'You already have a trip in progress. Please complete or cancel it before starting a new trip.',
          existingTripId: existingInProgressTrip.id,
        },
        { status: 409 }
      );
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Generate geohash with precision 5 (approximately 5km x 5km)
    const travelerGeohash = geohash.encode(latitude, longitude, 5);
    
    // Set OTP expiration to 30 minutes from now
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // Check if verification already exists
    const [existingVerification] = await db
      .select()
      .from(tripVerifications)
      .where(eq(tripVerifications.tripId, tripId))
      .limit(1);
    
    if (existingVerification) {
      // Update existing verification
      await db
        .update(tripVerifications)
        .set({
          otp,
          travelerGeohash,
          guideGeohash: null,
          verified: false,
          verifiedAt: null,
          expiresAt,
        })
        .where(eq(tripVerifications.tripId, tripId));
    } else {
      // Create new verification record
      await db.insert(tripVerifications).values({
        tripId,
        otp,
        travelerGeohash,
        expiresAt,
      });
    }

    // Update trip status to IN_PROGRESS and bookingStatus to ACCEPTED
    await db
      .update(trips)
      .set({
        status: 'IN_PROGRESS',
        bookingStatus: 'ACCEPTED',
        updatedAt: new Date(),
      })
      .where(eq(trips.id, tripId));

    // Update traveler.tripInProgress to true
    await db
      .update(travelers)
      .set({ tripInProgress: true })
      .where(eq(travelers.id, traveler.id));

    // If trip has a guide, update guide.tripInProgress to true
    if (trip.guideId) {
      await db
        .update(guides)
        .set({ tripInProgress: true })
        .where(eq(guides.id, trip.guideId));
    }

    // Get guide phone number if guide is assigned
    let guidePhone = null;
    if (trip.guideId) {
      const [guide] = await db
        .select({ userId: guides.userId })
        .from(guides)
        .where(eq(guides.id, trip.guideId))
        .limit(1);

      if (guide) {
        const [guideUser] = await db
          .select({ phone: users.phone })
          .from(users)
          .where(eq(users.id, guide.userId))
          .limit(1);

        if (guideUser) {
          guidePhone = guideUser.phone;
        }
      }
    }

    // Return success response with OTP and guide phone
    return NextResponse.json(
      {
        success: true,
        message: 'Trip started successfully. Share the OTP with your guide.',
        tripId: tripId,
        otp: otp,
        guidePhone: guidePhone,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Start trip error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
