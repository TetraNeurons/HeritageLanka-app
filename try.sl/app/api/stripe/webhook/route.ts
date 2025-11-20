import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { payments, events } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Webhook event received:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'checkout.session.expired':
        console.log('Checkout session expired:', event.data.object.id);
        // Payment remains PENDING
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const paymentId = session.metadata?.paymentId;

  if (!paymentId) {
    console.error('No paymentId in session metadata');
    return;
  }

  console.log('Processing payment:', paymentId);

  try {
    // Use transaction for atomic updates
    await db.transaction(async (tx) => {
      // Get the payment record
      const payment = await tx
        .select()
        .from(payments)
        .where(eq(payments.id, paymentId))
        .limit(1);

      if (!payment || payment.length === 0) {
        throw new Error('Payment not found');
      }

      const paymentData = payment[0];

      // Check if already processed (idempotency)
      if (paymentData.status === 'PAID') {
        console.log('Payment already processed:', paymentId);
        return;
      }

      // Update payment status to PAID
      await tx
        .update(payments)
        .set({
          status: 'PAID',
          paidAt: new Date(),
        })
        .where(eq(payments.id, paymentId));

      // If this is an event payment, decrement ticket count
      if (paymentData.eventId && paymentData.ticketQuantity) {
        console.log(
          `Decrementing ticket count for event ${paymentData.eventId} by ${paymentData.ticketQuantity}`
        );

        // Lock the event row and decrement ticket count
        const event = await tx
          .select()
          .from(events)
          .where(eq(events.id, paymentData.eventId))
          .for('update');

        if (event && event.length > 0) {
          const newTicketCount = event[0].ticketCount - paymentData.ticketQuantity;

          await tx
            .update(events)
            .set({
              ticketCount: Math.max(0, newTicketCount), // Ensure non-negative
              updatedAt: new Date(),
            })
            .where(eq(events.id, paymentData.eventId));

          console.log(
            `Ticket count updated: ${event[0].ticketCount} -> ${newTicketCount}`
          );
        }
      }

      console.log('Payment processed successfully:', paymentId);
    });
  } catch (error: any) {
    console.error('Error processing payment:', error);
    throw error;
  }
}
