import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { payments, trips, travelers, users } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and ADMIN role
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Build query conditions
    const conditions = [];
    
    // Support status filter query parameter
    if (statusFilter) {
      conditions.push(eq(payments.status, statusFilter as any));
    }

    // Support date range filters (fromDate, toDate)
    if (fromDate) {
      conditions.push(gte(payments.createdAt, new Date(fromDate)));
    }
    if (toDate) {
      conditions.push(lte(payments.createdAt, new Date(toDate)));
    }

    // Query all payments from all travelers
    // Join with trips, travelers, and users tables
    const allPayments = await db
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
        travelerId: travelers.id,
        travelerName: users.name,
        travelerEmail: users.email,
      })
      .from(payments)
      .innerJoin(trips, eq(payments.tripId, trips.id))
      .innerJoin(travelers, eq(trips.travelerId, travelers.id))
      .innerJoin(users, eq(travelers.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(payments.createdAt));

    // Return complete payment information with traveler details
    const formattedPayments = allPayments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      traveler: {
        id: payment.travelerId,
        name: payment.travelerName,
        email: payment.travelerEmail,
      },
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
    console.error('Get admin payments error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
