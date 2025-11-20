import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { payments, trips, travelers } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
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

    // Query payments for authenticated traveler's trips
    // Join with trips table for trip details
    const travelerPayments = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        status: payments.status,
        paidAt: payments.paidAt,
        createdAt: payments.createdAt,
        tripId: trips.id,
        tripFromDate: trips.fromDate,
        tripToDate: trips.toDate,
        tripCountry: trips.country,
        tripStatus: trips.status,
        numberOfPeople: trips.numberOfPeople,
        totalDistance: trips.totalDistance,
      })
      .from(payments)
      .innerJoin(trips, eq(payments.tripId, trips.id))
      .where(eq(trips.travelerId, traveler.id))
      .orderBy(desc(payments.createdAt));

    // Return payment history with trip information
    const formattedPayments = travelerPayments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      trip: {
        id: payment.tripId,
        fromDate: payment.tripFromDate,
        toDate: payment.tripToDate,
        country: payment.tripCountry,
        status: payment.tripStatus,
        numberOfPeople: payment.numberOfPeople,
        totalDistance: payment.totalDistance,
      },
    }));

    return NextResponse.json(
      {
        success: true,
        payments: formattedPayments,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get payment history error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
