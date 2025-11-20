import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";
import {
  updateAdvertisementStatus,
  deleteAdvertisement,
  getAdvertisementById,
  AdStatus,
} from "@/lib/advertisements";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status || !["PENDING", "ACTIVE", "INACTIVE", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status value" },
        { status: 400 }
      );
    }

    // Get current advertisement to validate transition
    const currentAd = await getAdvertisementById(id);
    if (!currentAd) {
      return NextResponse.json(
        { success: false, message: "Advertisement not found" },
        { status: 404 }
      );
    }

    // Update status
    const advertisement = await updateAdvertisementStatus(
      id,
      status as AdStatus,
      session.userId
    );

    if (!advertisement) {
      return NextResponse.json(
        { success: false, message: "Failed to update advertisement" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      advertisement,
    });
  } catch (error) {
    console.error("Error updating advertisement:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update advertisement" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const success = await deleteAdvertisement(id);

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Advertisement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Advertisement deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting advertisement:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete advertisement" },
      { status: 500 }
    );
  }
}
