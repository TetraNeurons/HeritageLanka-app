import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { trips, travelers, users, guides, tripLocations } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';
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
    const searchTerm = searchParams.get('search');

    // Build query conditions
    const conditions = [];
    if (statusFilter) {
      conditions.push(eq(trips.status, statusFilter as any));
    }

    // Query all trips from all travelers
    // Join with travelers, users, guides, and locations tables
    let allTrips = await db
      .select({
        id: trips.id,
        fromDate: trips.fromDate,
        toDate: trips.toDate,
        numberOfPeople: trips.numberOfPeople,
        country: trips.country,
        status: trips.status,
        bookingStatus: trips.bookingStatus,
        totalDistance: trips.totalDistance,
        needsGuide: trips.needsGuide,
        planDescription: trips.planDescription,
        createdAt: trips.createdAt,
        updatedAt: trips.updatedAt,
        travelerId: travelers.id,
        travelerName: users.name,
        travelerEmail: users.email,
        guideId: trips.guideId,
      })
      .from(trips)
      .innerJoin(travelers, eq(trips.travelerId, travelers.id))
      .innerJoin(users, eq(travelers.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(trips.createdAt));

    // Support search by traveler name
    if (searchTerm) {
      allTrips = allTrips.filter((trip) =>
        trip.travelerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Fetch guide names and locations for each trip
    const tripsWithDetails = await Promise.all(
      allTrips.map(async (trip) => {
        // Get guide information if exists
        let guideName = null;
        if (trip.guideId) {
          const [guideData] = await db
            .select({
              name: users.name,
            })
            .from(guides)
            .innerJoin(users, eq(guides.userId, users.id))
            .where(eq(guides.id, trip.guideId))
            .limit(1);

          if (guideData) {
            guideName = guideData.name;
          }
        }

        // Get trip locations
        const locations = await db
          .select()
          .from(tripLocations)
          .where(eq(tripLocations.tripId, trip.id))
          .orderBy(tripLocations.dayNumber, tripLocations.visitOrder);

        return {
          id: trip.id,
          fromDate: trip.fromDate,
          toDate: trip.toDate,
          numberOfPeople: trip.numberOfPeople,
          country: trip.country,
          status: trip.status,
          bookingStatus: trip.bookingStatus,
          totalDistance: trip.totalDistance,
          needsGuide: trip.needsGuide,
          planDescription: trip.planDescription,
          createdAt: trip.createdAt,
          updatedAt: trip.updatedAt,
          traveler: {
            id: trip.travelerId,
            name: trip.travelerName,
            email: trip.travelerEmail,
          },
          guide: trip.guideId
            ? {
                id: trip.guideId,
                name: guideName,
              }
            : null,
          locations,
        };
      })
    );

    // Return complete trip information
    return NextResponse.json(
      {
        success: true,
        trips: tripsWithDetails,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get admin trips error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
