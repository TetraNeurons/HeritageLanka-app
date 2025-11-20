import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { events, payments, travelers, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
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
    const { id: eventId } = await params;
    
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

    const body = await request.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Get traveler ID
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const traveler = await db
      .select()
      .from(travelers)
      .where(eq(travelers.userId, user[0].id))
      .limit(1);

    if (!traveler || traveler.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Traveler not found' },
        { status: 404 }
      );
    }

    // Use transaction for atomic operations
    const result = await db.transaction(async (tx) => {
      // Get payment record
      const payment = await tx
        .select()
        .from(payments)
        .where(eq(payments.id, paymentId))
        .limit(1);

      if (!payment || payment.length === 0) {
        throw new Error('Payment not found');
      }

      const paymentData = payment[0];

      // Verify this is an event payment
      if (!paymentData.eventId) {
        throw new Error('This is not an event ticket purchase');
      }

      // Verify payment status is PAID
      if (paymentData.status !== 'PAID') {
        throw new Error('Only paid tickets can be cancelled');
      }

      // Get event details
      const event = await tx
        .select()
        .from(events)
        .where(eq(events.id, paymentData.eventId))
        .limit(1);

      if (!event || event.length === 0) {
        throw new Error('Event not found');
      }

      const eventData = event[0];

      // Check if event date has passed
      const eventDate = new Date(eventData.date);
      const now = new Date();
      
      if (eventDate < now) {
        throw new Error('Cannot cancel tickets for past events');
      }

      // Update payment status to CANCELLED
      await tx
        .update(payments)
        .set({
          status: 'CANCELLED',
        })
        .where(eq(payments.id, paymentId));

      // Increment event ticket count
      await tx
        .update(events)
        .set({
          ticketCount: eventData.ticketCount + (paymentData.ticketQuantity || 0),
          updatedAt: new Date(),
        })
        .where(eq(events.id, paymentData.eventId));

      return { payment: paymentData, event: eventData };
    });

    // Initiate Stripe refund
    if (result.payment.stripeSessionId) {
      try {
        // Get the payment intent from the checkout session
        const session = await stripe.checkout.sessions.retrieve(
          result.payment.stripeSessionId
        );

        if (session.payment_intent) {
          const refund = await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
            reason: 'requested_by_customer',
          });

          console.log('Refund created:', refund.id);
        }
      } catch (stripeError: any) {
        console.error('Stripe refund error:', stripeError);
        // Don't fail the whole operation if refund fails
        // The payment is already marked as CANCELLED
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket purchase cancelled successfully',
    });
  } catch (error: any) {
    console.error('Ticket cancellation error:', error);

    if (error.message === 'Payment not found') {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (error.message === 'This is not an event ticket purchase') {
      return NextResponse.json(
        { success: false, error: 'This is not an event ticket purchase' },
        { status: 400 }
      );
    }

    if (error.message === 'Only paid tickets can be cancelled') {
      return NextResponse.json(
        { success: false, error: 'Only paid tickets can be cancelled' },
        { status: 400 }
      );
    }

    if (error.message === 'Cannot cancel tickets for past events') {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel tickets for past events' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to cancel ticket purchase' },
      { status: 500 }
    );
  }
}
