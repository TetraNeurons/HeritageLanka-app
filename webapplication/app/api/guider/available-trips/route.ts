import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { trips, travelers, users, guides, guideDeclinations, tripLocations } from '@/db/schema';
import { eq, and, isNull, notInArray, sql } from 'drizzle-orm';
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

    // Get guide's languages from user table
    const [guideUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!guideUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const guideLanguages = guideUser.languages;

    // Get trips this guide has declined
    const declinedTrips = await db
      .select({ tripId: guideDeclinations.tripId })
      .from(guideDeclinations)
      .where(eq(guideDeclinations.guideId, guide.id));

    const declinedTripIds = declinedTrips.map(d => d.tripId);

    // Query available trips with filters:
    // 1. status = PLANNING
    // 2. needsGuide = true
    // 3. guideId is null (not already assigned)
    // 4. Not in declined trips list
    let availableTripsQuery = db
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
          eq(trips.status, 'PLANNING'),
          eq(trips.needsGuide, true),
          isNull(trips.guideId)
        )
      )
      .orderBy(trips.fromDate);

    const availableTripsData = await availableTripsQuery;

    // Filter by language matching and exclude declined trips
    const filteredTrips = availableTripsData.filter(({ trip, travelerUser }) => {
      // Exclude declined trips
      if (declinedTripIds.includes(trip.id)) {
        return false;
      }

      // Check for shared languages
      const travelerLanguages = travelerUser.languages;
      const sharedLanguages = guideLanguages.filter(lang => 
        travelerLanguages.includes(lang)
      );

      return sharedLanguages.length > 0;
    });

    // Fetch locations for each trip and calculate shared languages
    const tripsWithDetails = await Promise.all(
      filteredTrips.map(async ({ trip, travelerUser }) => {
        // Get trip locations
        const locations = await db
          .select()
          .from(tripLocations)
          .where(eq(tripLocations.tripId, trip.id))
          .orderBy(tripLocations.dayNumber, tripLocations.visitOrder);

        // Calculate shared languages
        const travelerLanguages = travelerUser.languages;
        const sharedLanguages = guideLanguages.filter(lang => 
          travelerLanguages.includes(lang)
        );

        return {
          id: trip.id,
          traveler: {
            name: travelerUser.name,
            languages: travelerLanguages,
          },
          fromDate: trip.fromDate.toISOString(),
          toDate: trip.toDate.toISOString(),
          numberOfPeople: trip.numberOfPeople,
          country: trip.country,
          totalDistance: trip.totalDistance,
          sharedLanguages,
          locations,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        trips: tripsWithDetails,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get available trips error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
