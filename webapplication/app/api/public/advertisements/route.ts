import { NextRequest, NextResponse } from "next/server";
import { createAdvertisement } from "@/lib/advertisements";

// URL validation helper
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, imageUrl, description, redirectUrl } = body;

    // Validate required fields
    if (!email || !imageUrl || !description || !redirectUrl) {
      return NextResponse.json(
        { success: false, message: "All fields are required: email, imageUrl, description, redirectUrl" },
        { status: 400 }
      );
    }

    // Validate email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate description length
    if (description.length > 500) {
      return NextResponse.json(
        { success: false, message: "Description must be 500 characters or less" },
        { status: 400 }
      );
    }

    // Validate URLs
    if (!isValidUrl(imageUrl)) {
      return NextResponse.json(
        { success: false, message: "Invalid image URL format. Must be a valid HTTP/HTTPS URL" },
        { status: 400 }
      );
    }

    if (!isValidUrl(redirectUrl)) {
      return NextResponse.json(
        { success: false, message: "Invalid redirect URL format. Must be a valid HTTP/HTTPS URL" },
        { status: 400 }
      );
    }

    // Create advertisement
    const advertisement = await createAdvertisement({
      email,
      imageUrl,
      description,
      redirectUrl,
    });

    return NextResponse.json({
      success: true,
      paymentReference: advertisement.paymentReference,
      message: "Advertisement submitted successfully. Please complete payment using the reference ID.",
    });
  } catch (error) {
    console.error("Error creating advertisement:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit advertisement" },
      { status: 500 }
    );
  }
}
