import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { getRandomActiveAdvertisement } from "@/lib/advertisements";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || session.role !== "TRAVELER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const advertisement = await getRandomActiveAdvertisement();

    return NextResponse.json({
      success: true,
      advertisement,
    });
  } catch (error) {
    console.error("Error fetching random advertisement:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch advertisement" },
      { status: 500 }
    );
  }
}
