import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { trips, travelers, tripLocations, payments, guides, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Implement authentication middleware check
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

    // Query trips for authenticated traveler with joins for locations and payments
    const travelerTrips = await db
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
        guideId: trips.guideId,
        planDescription: trips.planDescription,
        aiSummary: trips.aiSummary,
        createdAt: trips.createdAt,
        updatedAt: trips.updatedAt,
      })
      .from(trips)
      .where(eq(trips.travelerId, traveler.id))
      .orderBy(desc(trips.createdAt));

    // Fetch locations, payments, and guide info for each trip
    const tripsWithDetails = await Promise.all(
      travelerTrips.map(async (trip) => {
        // Get trip locations
        const locations = await db
          .select()
          .from(tripLocations)
          .where(eq(tripLocations.tripId, trip.id))
          .orderBy(tripLocations.dayNumber, tripLocations.visitOrder);

        // Get payment if exists
        const [payment] = await db
          .select()
          .from(payments)
          .where(eq(payments.tripId, trip.id))
          .limit(1);

        // Get guide info if assigned
        let guideInfo = null;
        if (trip.needsGuide && trip.status !== 'PLANNING') {
          const [guideData] = await db
            .select({
              guideId: guides.id,
              userId: guides.userId,
            })
            .from(guides)
            .innerJoin(users, eq(guides.userId, users.id))
            .where(eq(guides.id, trip.guideId!))
            .limit(1);

          if (guideData) {
            const [guideUser] = await db
              .select({
                name: users.name,
                phone: users.phone,
                languages: users.languages,
              })
              .from(users)
              .where(eq(users.id, guideData.userId))
              .limit(1);

            if (guideUser) {
              guideInfo = {
                userId: guideData.userId, // Include userId for reviews
                name: guideUser.name,
                languages: guideUser.languages,
                // Only include phone if trip is IN_PROGRESS
                ...(trip.status === 'IN_PROGRESS' && { phone: guideUser.phone }),
              };
            }
          }
        }

        return {
          ...trip,
          locations,
          payment: payment || null,
          guide: guideInfo,
        };
      })
    );

    // Handle empty results case
    return NextResponse.json(
      {
        success: true,
        trips: tripsWithDetails,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get trips error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
