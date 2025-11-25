import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { trips, tripLocations, guides, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user || authResult.user.role !== "TRAVELER") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: tripId } = await params;

    // Fetch trip with guide and locations
    const [trip] = await db
      .select({
        id: trips.id,
        fromDate: trips.fromDate,
        toDate: trips.toDate,
        numberOfPeople: trips.numberOfPeople,
        country: trips.country,
        status: trips.status,
        totalDistance: trips.totalDistance,
        planDescription: trips.planDescription,
        aiSummary: trips.aiSummary,
        guideId: trips.guideId,
      })
      .from(trips)
      .where(
        and(
          eq(trips.id, tripId),
          eq(trips.status, "IN_PROGRESS")
        )
      )
      .limit(1);

    if (!trip) {
      return NextResponse.json(
        { success: false, error: "Trip not found or not in progress" },
        { status: 404 }
      );
    }

    // Fetch guide info if exists
    let guideInfo = null;
    if (trip.guideId) {
      const [guideData] = await db
        .select({
          userId: users.id,
          name: users.name,
          phone: users.phone,
          languages: users.languages,
        })
        .from(guides)
        .innerJoin(users, eq(guides.userId, users.id))
        .where(eq(guides.id, trip.guideId))
        .limit(1);

      if (guideData) {
        guideInfo = guideData;
      }
    }

    // Fetch all locations ordered by day and visit order
    const locations = await db
      .select()
      .from(tripLocations)
      .where(eq(tripLocations.tripId, tripId))
      .orderBy(tripLocations.dayNumber, tripLocations.visitOrder);

    // Calculate current day of trip
    const today = new Date();
    const startDate = new Date(trip.fromDate);
    const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentDay = Math.max(1, daysDiff + 1);

    return NextResponse.json({
      success: true,
      trip: {
        ...trip,
        guide: guideInfo,
        locations,
        currentDay,
      },
    });
  } catch (error) {
    console.error("Error fetching trip tracking data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trip data" },
      { status: 500 }
    );
  }
}
