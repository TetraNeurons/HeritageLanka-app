import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { events, payments, travelers, eventTickets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication using session
    const userSession = await getSession();
    if (!userSession?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: eventId } = await params;
    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid ticket quantity' },
        { status: 400 }
      );
    }

    // Get traveler for authenticated user
    const [traveler] = await db
      .select()
      .from(travelers)
      .where(eq(travelers.userId, userSession.userId))
      .limit(1);

    if (!traveler) {
      return NextResponse.json(
        { success: false, error: 'Traveler profile not found' },
        { status: 404 }
      );
    }

    // Get event data
    const [eventData] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!eventData) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Verify sufficient tickets
    if (eventData.ticketCount < quantity) {
      return NextResponse.json(
        { success: false, error: 'Insufficient tickets available' },
        { status: 409 }
      );
    }

    // Calculate amount
    const amount = calculateTicketAmount(eventData.price, quantity);

    // Check if this is a free event
    const isFreeEvent = amount === 0;

    // For paid events, check Stripe minimum amount (50 cents USD)
    if (!isFreeEvent && amount < 0.50) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Event price is too low for online payment. Minimum amount is $0.50 per ticket.' 
        },
        { status: 400 }
      );
    }

    // Create payment record
    const [payment] = await db
      .insert(payments)
      .values({
        eventId,
        travelerId: traveler.id,
        ticketQuantity: quantity,
        amount,
        status: isFreeEvent ? 'PAID' : 'PENDING',
      })
      .returning();

    // For free events, decrement ticket count immediately and create ticket record
    if (isFreeEvent) {
      await db
        .update(events)
        .set({ ticketCount: eventData.ticketCount - quantity })
        .where(eq(events.id, eventId));

      // Create event ticket record
      await db.insert(eventTickets).values({
        eventId,
        travelerId: traveler.id,
        paymentId: payment.id,
        quantity,
      });
    }

    const result = { payment, event: eventData, amount, isFreeEvent };

    // Handle free events - return success immediately
    if (result.isFreeEvent) {
      return NextResponse.json({
        success: true,
        payment: {
          id: result.payment.id,
          amount: result.payment.amount,
          status: result.payment.status,
        },
      });
    }

    // For paid events, create Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: result.event.title,
              description: `${quantity} ticket(s) for ${result.event.title}`,
              images: result.event.images.slice(0, 1),
            },
            unit_amount: Math.round((result.amount / quantity) * 100), // Convert to cents
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/traveler/events/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/traveler/events?payment=cancelled`,
      metadata: {
        paymentId: result.payment.id,
        eventId,
        travelerId: traveler.id,
        quantity: quantity.toString(),
        userId: userSession.userId,
      },
    });

    // Update payment with Stripe session ID
    await db
      .update(payments)
      .set({ stripeSessionId: stripeSession.id })
      .where(eq(payments.id, result.payment.id));

    return NextResponse.json({
      success: true,
      sessionUrl: stripeSession.url,
      sessionId: stripeSession.id,
    });
  } catch (error: any) {
    console.error('Event ticket purchase error:', error);
    
    if (error.message === 'Event not found') {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    
    if (error.message === 'Insufficient tickets available') {
      return NextResponse.json(
        { success: false, error: 'Insufficient tickets available' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process ticket purchase' },
      { status: 500 }
    );
  }
}

function calculateTicketAmount(price: string, quantity: number): number {
  // Handle "Free" events
  if (price.toLowerCase().includes('free')) {
    return 0;
  }

  // Extract numeric value from price string (e.g., "$10" or "10 USD" -> 10)
  const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
  
  if (isNaN(numericPrice)) {
    throw new Error('Invalid price format');
  }

  return numericPrice * quantity;
}
