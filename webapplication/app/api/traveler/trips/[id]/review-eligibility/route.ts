import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { checkReviewEligibility } from '@/lib/review-eligibility';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isValid || !authResult.payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a traveler
    if (authResult.payload.role !== 'TRAVELER') {
      return NextResponse.json(
        { success: false, error: 'Only travelers can access this endpoint' },
        { status: 403 }
      );
    }

    const userId = authResult.payload.userId;
    const tripId = params.id;

    // Check review eligibility
    const eligibility = await checkReviewEligibility(tripId, userId, 'TRAVELER');

    return NextResponse.json({
      success: true,
      eligibility,
    });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check review eligibility' },
      { status: 500 }
    );
  }
}
