import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { trips, guides, travelers, users, tripLocations } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
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

    // Calculate total completed trips
    const completedTripsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(trips)
      .where(
        and(
          eq(trips.guideId, guide.id),
          eq(trips.status, 'COMPLETED')
        )
      );

    const totalCompleted = completedTripsResult[0]?.count || 0;

    // Get current IN_PROGRESS trip if any
    const inProgressTrips = await db
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
          eq(trips.status, 'IN_PROGRESS')
        )
      )
      .limit(1);

    let currentTrip = null;
    if (inProgressTrips.length > 0) {
      const { trip, travelerUser } = inProgressTrips[0];
      
      // Get trip locations
      const locations = await db
        .select()
        .from(tripLocations)
        .where(eq(tripLocations.tripId, trip.id))
        .orderBy(tripLocations.dayNumber, tripLocations.visitOrder);

      currentTrip = {
        id: trip.id,
        traveler: {
          userId: travelerUser.id,
          name: travelerUser.name,
          phone: travelerUser.phone,
        },
        fromDate: trip.fromDate.toISOString(),
        toDate: trip.toDate.toISOString(),
        numberOfPeople: trip.numberOfPeople,
        country: trip.country,
        totalDistance: trip.totalDistance,
        locations,
      };
    }

    // Count upcoming CONFIRMED trips
    const upcomingTripsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(trips)
      .where(
        and(
          eq(trips.guideId, guide.id),
          eq(trips.status, 'CONFIRMED')
        )
      );

    const upcomingTrips = upcomingTripsResult[0]?.count || 0;

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalCompleted,
          currentTrip,
          upcomingTrips,
          rating: guide.rating,
          totalReviews: guide.totalReviews,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
