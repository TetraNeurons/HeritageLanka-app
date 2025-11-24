import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { trips, travelers, guides, payments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyAuth } from "@/lib/auth";

export async function POST(
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

    // Fetch trip to verify it's in progress
    const [trip] = await db
      .select()
      .from(trips)
      .where(eq(trips.id, tripId))
      .limit(1);

    if (!trip) {
      return NextResponse.json(
        { success: false, error: "Trip not found" },
        { status: 404 }
      );
    }

    if (trip.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { success: false, error: "Trip is not in progress" },
        { status: 400 }
      );
    }

    // Update trip status to COMPLETED
    await db
      .update(trips)
      .set({
        status: "COMPLETED",
        bookingStatus: "COMPLETED",
        updatedAt: new Date(),
      })
      .where(eq(trips.id, tripId));

    // Update traveler's tripInProgress flag
    await db
      .update(travelers)
      .set({ tripInProgress: false })
      .where(eq(travelers.id, trip.travelerId));

    // Update guide's tripInProgress flag if guide exists
    if (trip.guideId) {
      await db
        .update(guides)
        .set({ tripInProgress: false })
        .where(eq(guides.id, trip.guideId));

      // Release payment to guide
      await db
        .update(payments)
        .set({
          status: "RELEASED",
          releasedAt: new Date(),
        })
        .where(eq(payments.tripId, tripId));
    }

    return NextResponse.json({
      success: true,
      message: "Trip completed successfully",
    });
  } catch (error) {
    console.error("Error completing trip:", error);
    return NextResponse.json(
      { success: false, error: "Failed to complete trip" },
      { status: 500 }
    );
  }
}
