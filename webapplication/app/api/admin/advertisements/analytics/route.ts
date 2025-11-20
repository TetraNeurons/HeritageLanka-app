import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { getAdvertisementAnalytics } from "@/lib/advertisements";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const analytics = await getAdvertisementAnalytics();

    return NextResponse.json({
      success: true,
      ...analytics,
    });
  } catch (error) {
    console.error("Error fetching advertisement analytics:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
