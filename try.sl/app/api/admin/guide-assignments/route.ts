import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { trips, travelers, users as usersTable, guides } from '@/db/schema';
import { eq, isNull, isNotNull } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Authenticate and verify admin role
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin role required' },
        { status: 403 }
      );
    }

    // Get filter from query params
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'needs-guide', 'assigned', 'unassigned', or null for all

    // Build query based on filter
    let tripsQuery = db
      .select({
        trip: trips,
        traveler: travelers,
        travelerUser: usersTable,
      })
      .from(trips)
      .innerJoin(travelers, eq(trips.travelerId, travelers.id))
      .innerJoin(usersTable, eq(travelers.userId, usersTable.id));

    // Apply filters
    if (filter === 'needs-guide') {
      tripsQuery = tripsQuery.where(
        eq(trips.needsGuide, true)
      ) as any;
    } else if (filter === 'assigned') {
      tripsQuery = tripsQuery.where(
        isNotNull(trips.guideId)
      ) as any;
    } else if (filter === 'unassigned') {
      tripsQuery = tripsQuery.where(
        isNull(trips.guideId)
      ) as any;
    }

    const tripsData = await tripsQuery;

    // Fetch guide info for trips with assigned guides
    const tripsWithGuideInfo = await Promise.all(
      tripsData.map(async ({ trip, travelerUser }) => {
        let guideInfo = null;

        if (trip.guideId) {
          const [guideData] = await db
            .select({
              guideId: guides.id,
              userId: guides.userId,
            })
            .from(guides)
            .where(eq(guides.id, trip.guideId))
            .limit(1);

          if (guideData) {
            const [guideUser] = await db
              .select({
                name: usersTable.name,
                email: usersTable.email,
              })
              .from(usersTable)
              .where(eq(usersTable.id, guideData.userId))
              .limit(1);

            if (guideUser) {
              guideInfo = {
                name: guideUser.name,
                email: guideUser.email,
              };
            }
          }
        }

        return {
          id: trip.id,
          traveler: {
            name: travelerUser.name,
            email: travelerUser.email,
          },
          guide: guideInfo,
          status: trip.status,
          needsGuide: trip.needsGuide,
          fromDate: trip.fromDate.toISOString(),
          toDate: trip.toDate.toISOString(),
          country: trip.country,
          numberOfPeople: trip.numberOfPeople,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        trips: tripsWithGuideInfo,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get guide assignments error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
