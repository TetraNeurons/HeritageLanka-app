import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { db } from '@/db/drizzle';
import { payments, events, eventTickets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

// Disable body parsing for webhook
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    console.log('📨 Received Stripe webhook event:', event.type, 'ID:', event.id);
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('💳 Payment successful for session:', session.id, 'Metadata:', session.metadata);
        
        // Get payment record
        const [payment] = await db
          .select()
          .from(payments)
          .where(eq(payments.stripeSessionId, session.id))
          .limit(1);

        if (!payment) {
          console.error('Payment not found for session:', session.id);
          break;
        }

        // Check if already processed (by the success handler)
        if (payment.status === 'PAID') {
          console.log('⚠️ Payment already processed:', payment.id);
          break;
        }

        // Update payment status to PAID
        await db
          .update(payments)
          .set({
            status: 'PAID',
            paidAt: new Date(),
          })
          .where(eq(payments.id, payment.id));

        console.log('Payment updated to PAID:', payment.id);

        // Decrement ticket count for the event (only if eventId exists)
        if (payment.eventId && payment.ticketQuantity && payment.travelerId) {
          console.log('Processing event ticket purchase:', {
            paymentId: payment.id,
            eventId: payment.eventId,
            travelerId: payment.travelerId,
            quantity: payment.ticketQuantity,
          });

          const [eventRecord] = await db
            .select()
            .from(events)
            .where(eq(events.id, payment.eventId))
            .limit(1);

          if (eventRecord) {
            const newTicketCount = Math.max(0, eventRecord.ticketCount - payment.ticketQuantity);
            
            try {
              // Update ticket count
              await db
                .update(events)
                .set({ ticketCount: newTicketCount })
                .where(eq(events.id, payment.eventId));

              console.log(
                `✅ Decremented ticket count for event ${payment.eventId}: ${eventRecord.ticketCount} -> ${newTicketCount}`
              );

              // Create event ticket record
              await db.insert(eventTickets).values({
                eventId: payment.eventId,
                travelerId: payment.travelerId,
                paymentId: payment.id,
                quantity: payment.ticketQuantity,
              });

              console.log(
                `✅ Created event ticket record for traveler ${payment.travelerId}, event ${payment.eventId}, quantity ${payment.ticketQuantity}`
              );
            } catch (dbError: any) {
              console.error('❌ Database error while processing event ticket:', {
                error: dbError.message,
                stack: dbError.stack,
                paymentId: payment.id,
                eventId: payment.eventId,
              });
              throw dbError; // Re-throw to trigger webhook retry
            }
          } else {
            console.error('❌ Event not found for payment:', payment.eventId);
          }
        } else {
          console.log('⚠️ Skipping event ticket processing - missing required fields:', {
            hasEventId: !!payment.eventId,
            hasTicketQuantity: !!payment.ticketQuantity,
            hasTravelerId: !!payment.travelerId,
            payment: payment,
          });
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('Payment session expired:', session.id);
        
        // Optionally update payment status to CANCELLED
        const [payment] = await db
          .select()
          .from(payments)
          .where(eq(payments.stripeSessionId, session.id))
          .limit(1);

        if (payment && payment.status === 'PENDING') {
          await db
            .update(payments)
            .set({
              status: 'CANCELLED',
            })
            .where(eq(payments.id, payment.id));

          console.log('Payment cancelled due to expiration:', payment.id);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    );
  }
}
