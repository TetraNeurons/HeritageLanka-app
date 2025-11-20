import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import { getAllAdvertisements, AdStatus } from "@/lib/advertisements";

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

    // Get status filter from query params
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get("status") as AdStatus | null;

    // Validate status filter if provided
    if (statusFilter && !["PENDING", "ACTIVE", "INACTIVE", "REJECTED"].includes(statusFilter)) {
      return NextResponse.json(
        { success: false, message: "Invalid status filter" },
        { status: 400 }
      );
    }

    const advertisements = await getAllAdvertisements(statusFilter || undefined);

    return NextResponse.json({
      success: true,
      advertisements,
    });
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch advertisements" },
      { status: 500 }
    );
  }
}
