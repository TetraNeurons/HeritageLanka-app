import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { payments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { success: false, error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify Stripe webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { success: false, error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Find payment by Stripe session ID
      const [payment] = await db
        .select()
        .from(payments)
        .where(eq(payments.stripeSessionId, session.id))
        .limit(1);

      if (payment) {
        // Update payment status to PAID and record paidAt timestamp
        await db
          .update(payments)
          .set({
            status: 'PAID',
            paidAt: new Date(),
          })
          .where(eq(payments.id, payment.id));

        console.log(`Payment ${payment.id} marked as PAID for session ${session.id}`);
      } else {
        console.warn(`No payment found for Stripe session ${session.id}`);
      }
    }

    // Handle checkout.session.expired event
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Find payment by Stripe session ID
      const [payment] = await db
        .select()
        .from(payments)
        .where(eq(payments.stripeSessionId, session.id))
        .limit(1);

      if (payment) {
        // Keep payment as PENDING (user can retry)
        console.log(`Checkout session expired for payment ${payment.id}, session ${session.id}`);
      }
    }

    // Return 200 response to Stripe
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}
