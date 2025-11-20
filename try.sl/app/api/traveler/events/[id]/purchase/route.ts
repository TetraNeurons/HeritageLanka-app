import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { events, payments, travelers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'TRAVELER') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
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
      .where(eq(travelers.userId, decoded.userId))
      .limit(1);

    if (!traveler) {
      return NextResponse.json(
        { success: false, error: 'Traveler profile not found' },
        { status: 404 }
      );
    }

    // Use transaction for atomic operations
    const result = await db.transaction(async (tx) => {
      // Lock the event row for update
      const event = await tx
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .for('update');

      if (!event || event.length === 0) {
        throw new Error('Event not found');
      }

      const eventData = event[0];

      // Verify sufficient tickets
      if (eventData.ticketCount < quantity) {
        throw new Error('Insufficient tickets available');
      }

      // Calculate amount
      const amount = calculateTicketAmount(eventData.price, quantity);

      // Create payment record with PENDING status
      const payment = await tx
        .insert(payments)
        .values({
          eventId,
          travelerId: traveler.id,
          ticketQuantity: quantity,
          amount,
          status: 'PENDING',
        })
        .returning();

      return { payment: payment[0], event: eventData, amount };
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'lkr',
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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/traveler/events?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/traveler/events?payment=cancelled`,
      metadata: {
        paymentId: result.payment.id,
        eventId,
        quantity: quantity.toString(),
        userId: decoded.userId, // Store userId for filtering payments later
      },
    });

    // Update payment with Stripe session ID
    await db
      .update(payments)
      .set({ stripeSessionId: session.id })
      .where(eq(payments.id, result.payment.id));

    return NextResponse.json({
      success: true,
      sessionUrl: session.url,
      sessionId: session.id,
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

  // Extract numeric value from price string (e.g., "500 LKR" -> 500)
  const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
  
  if (isNaN(numericPrice)) {
    throw new Error('Invalid price format');
  }

  return numericPrice * quantity;
}
