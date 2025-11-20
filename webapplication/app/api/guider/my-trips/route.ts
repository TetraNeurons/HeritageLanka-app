import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { trips, guides, travelers, users, tripLocations } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
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

    // Query trips assigned to this guide
    const guideTripsData = await db
      .select({
        trip: trips,
        traveler: travelers,
        travelerUser: users,
      })
      .from(trips)
      .innerJoin(travelers, eq(trips.travelerId, travelers.id))
      .innerJoin(users, eq(travelers.userId, users.id))
      .where(eq(trips.guideId, guide.id))
      .orderBy(desc(trips.fromDate));

    // Fetch locations for each trip and conditionally include phone
    const tripsWithDetails = await Promise.all(
      guideTripsData.map(async ({ trip, travelerUser }) => {
        // Get trip locations
        const locations = await db
          .select()
          .from(tripLocations)
          .where(eq(tripLocations.tripId, trip.id))
          .orderBy(tripLocations.dayNumber, tripLocations.visitOrder);

        // Build traveler object - include phone only if status = IN_PROGRESS
        const travelerInfo: any = {
          name: travelerUser.name,
        };

        if (trip.status === 'IN_PROGRESS') {
          travelerInfo.phone = travelerUser.phone;
        }

        return {
          id: trip.id,
          traveler: travelerInfo,
          fromDate: trip.fromDate.toISOString(),
          toDate: trip.toDate.toISOString(),
          status: trip.status,
          bookingStatus: trip.bookingStatus,
          numberOfPeople: trip.numberOfPeople,
          country: trip.country,
          totalDistance: trip.totalDistance,
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
    console.error('Get my trips error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
