import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { trips, travelers, payments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';
import { stripe, STRIPE_CONFIG, calculatePaymentAmount } from '@/lib/stripe';

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
          error: `Cannot initiate payment for trip with status ${trip.status}. Trip must be CONFIRMED.`,
        },
        { status: 400 }
      );
    }

    // Calculate payment amount using utility function
    const amount = calculatePaymentAmount(
      trip.totalDistance || 0,
      trip.numberOfPeople,
      trip.needsGuide
    );

    // Check if payment already exists
    const [existingPayment] = await db
      .select()
      .from(payments)
      .where(eq(payments.tripId, tripId))
      .limit(1);

    // Create Stripe Checkout Session with calculated amount
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: `Trip to ${trip.country}`,
              description: `${trip.numberOfPeople} people, ${Math.round(trip.totalDistance || 0)}km${trip.needsGuide ? ', with guide' : ''}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}&trip_id=${tripId}`,
      cancel_url: `${STRIPE_CONFIG.cancelUrl}?trip_id=${tripId}`,
      metadata: {
        tripId: tripId,
        travelerId: traveler.id,
      },
    });

    // Create or update payment record with PENDING status
    if (existingPayment) {
      // Update existing payment with new session ID
      await db
        .update(payments)
        .set({
          stripeSessionId: checkoutSession.id,
          amount: amount,
          status: 'PENDING',
        })
        .where(eq(payments.id, existingPayment.id));
    } else {
      // Create payment record with PENDING status
      await db.insert(payments).values({
        tripId: tripId,
        amount: amount,
        status: 'PENDING',
        stripeSessionId: checkoutSession.id,
      });
    }

    // Return session URL and ID
    return NextResponse.json(
      {
        success: true,
        sessionUrl: checkoutSession.url,
        sessionId: checkoutSession.id,
        amount: amount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
