import { NextRequest, NextResponse } from "next/server";
import { getAdvertisementByReference } from "@/lib/advertisements";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ref = searchParams.get("ref");

    if (!ref) {
      return NextResponse.json(
        { success: false, message: "Payment reference is required" },
        { status: 400 }
      );
    }

    const advertisement = await getAdvertisementByReference(ref);

    if (!advertisement) {
      return NextResponse.json(
        { success: false, message: "No advertisement found with this reference. Please check and try again." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      status: advertisement.status,
      viewCount: advertisement.viewCount,
      submittedAt: advertisement.submittedAt,
    });
  } catch (error) {
    console.error("Error fetching advertisement status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch advertisement status" },
      { status: 500 }
    );
  }
}
