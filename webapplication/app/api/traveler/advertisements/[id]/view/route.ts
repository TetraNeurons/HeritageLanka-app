import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { incrementViewCount } from "@/lib/advertisements";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || session.role !== "TRAVELER") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;

    await incrementViewCount(id);

    return NextResponse.json({
      success: true,
      message: "View count incremented",
    });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return NextResponse.json(
      { success: false, message: "Failed to increment view count" },
      { status: 500 }
    );
  }
}
