import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { trips, travelers, users, guides, tripLocations, tripVerifications } from '@/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Authenticate and verify guide role
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.role !== 'GUIDE') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Guide role required' },
        { status: 403 }
      );
    }

    // Get guide profile for authenticated user
    const [guide] = await db
      .select()
      .from(guides)
      .where(eq(guides.userId, session.userId))
      .limit(1);

    if (!guide) {
      return NextResponse.json(
        { success: false, error: 'Guide profile not found' },
        { status: 404 }
      );
    }

    // Query in-progress trips (status = CONFIRMED or IN_PROGRESS, assigned to this guide)
    const inProgressTripsData = await db
      .select({
        trip: trips,
        traveler: travelers,
        travelerUser: users,
      })
      .from(trips)
      .innerJoin(travelers, eq(trips.travelerId, travelers.id))
      .innerJoin(users, eq(travelers.userId, users.id))
      .where(
        and(
          eq(trips.guideId, guide.id),
          or(
            eq(trips.status, 'CONFIRMED'),
            eq(trips.status, 'IN_PROGRESS')
          )
        )
      )
      .orderBy(trips.fromDate);

    // Query job history (status = COMPLETED or CANCELLED, assigned to this guide)
    const jobHistoryData = await db
      .select({
        trip: trips,
        traveler: travelers,
        travelerUser: users,
      })
      .from(trips)
      .innerJoin(travelers, eq(trips.travelerId, travelers.id))
      .innerJoin(users, eq(travelers.userId, users.id))
      .where(
        and(
          eq(trips.guideId, guide.id),
          or(
            eq(trips.status, 'COMPLETED'),
            eq(trips.status, 'CANCELLED')
          )
        )
      )
      .orderBy(desc(trips.updatedAt));

    // Process in-progress jobs with locations and days remaining
    const inProgressJobs = await Promise.all(
      inProgressTripsData.map(async ({ trip, travelerUser }) => {
        // Get trip locations
        const locations = await db
          .select()
          .from(tripLocations)
          .where(eq(tripLocations.tripId, trip.id))
          .orderBy(tripLocations.dayNumber, tripLocations.visitOrder);

        // Get verification status
        const [verification] = await db
          .select()
          .from(tripVerifications)
          .where(eq(tripVerifications.tripId, trip.id))
          .limit(1);

        // Calculate days remaining
        const now = new Date();
        const endDate = new Date(trip.toDate);
        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
          id: trip.id,
          traveler: {
            name: travelerUser.name,
            phone: travelerUser.phone,
          },
          fromDate: trip.fromDate.toISOString(),
          toDate: trip.toDate.toISOString(),
          numberOfPeople: trip.numberOfPeople,
          country: trip.country,
          totalDistance: trip.totalDistance,
          status: trip.status,
          verified: verification?.verified || false,
          locations: locations.map(loc => ({
            id: loc.id,
            title: loc.title,
            address: loc.address,
            district: loc.district,
            dayNumber: loc.dayNumber,
            visitOrder: loc.visitOrder,
            estimatedDuration: loc.estimatedDuration,
          })),
          daysRemaining,
        };
      })
    );

    // Process job history
    const jobHistory = jobHistoryData.map(({ trip, travelerUser }) => ({
      id: trip.id,
      traveler: {
        name: travelerUser.name,
      },
      fromDate: trip.fromDate.toISOString(),
      toDate: trip.toDate.toISOString(),
      numberOfPeople: trip.numberOfPeople,
      country: trip.country,
      status: trip.status,
      completedAt: trip.updatedAt.toISOString(),
    }));

    // Calculate statistics
    const statistics = {
      inProgressCount: inProgressJobs.length,
      completedCount: jobHistory.filter(j => j.status === 'COMPLETED').length,
      cancelledCount: jobHistory.filter(j => j.status === 'CANCELLED').length,
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          inProgress: inProgressJobs,
          history: jobHistory,
          statistics,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get jobs error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
