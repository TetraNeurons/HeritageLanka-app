import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { payments, events, eventTickets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/traveler/events?payment=error`
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/traveler/events?payment=cancelled`
      );
    }

    // Get payment record
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.stripeSessionId, sessionId))
      .limit(1);

    if (!payment) {
      console.error('Payment not found for session:', sessionId);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/traveler/events?payment=error`
      );
    }

    // Check if already processed
    if (payment.status === 'PAID') {
      // Already processed, just redirect to success
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/traveler/events?payment=success`
      );
    }

    // Process the payment
    if (payment.eventId && payment.ticketQuantity && payment.travelerId) {
      // Get event
      const [eventRecord] = await db
        .select()
        .from(events)
        .where(eq(events.id, payment.eventId))
        .limit(1);

      if (!eventRecord) {
        console.error('Event not found:', payment.eventId);
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/traveler/events?payment=error`
        );
      }

      // Update payment status
      await db
        .update(payments)
        .set({
          status: 'PAID',
          paidAt: new Date(),
        })
        .where(eq(payments.id, payment.id));

      // Decrement ticket count
      const newTicketCount = Math.max(0, eventRecord.ticketCount - payment.ticketQuantity);
      await db
        .update(events)
        .set({ ticketCount: newTicketCount })
        .where(eq(events.id, payment.eventId));

      // Create event ticket record
      await db.insert(eventTickets).values({
        eventId: payment.eventId,
        travelerId: payment.travelerId,
        paymentId: payment.id,
        quantity: payment.ticketQuantity,
      });

      console.log('✅ Payment processed successfully:', {
        paymentId: payment.id,
        eventId: payment.eventId,
        travelerId: payment.travelerId,
        quantity: payment.ticketQuantity,
        oldTicketCount: eventRecord.ticketCount,
        newTicketCount,
      });
    }

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/traveler/events?payment=success`
    );
  } catch (error: any) {
    console.error('Payment success handler error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/traveler/events?payment=error`
    );
  }
}
