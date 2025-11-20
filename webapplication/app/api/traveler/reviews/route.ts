import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { createReview, getReviewsGiven, getReviewsReceived, ReviewValidationError } from '@/lib/review-service';
import { checkReviewEligibility } from '@/lib/review-eligibility';
import { recalculateGuideRating } from '@/lib/rating-calculator';

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { tripId, revieweeId, rating, comment } = body;

    // Validate required fields
    if (!tripId || !revieweeId || rating === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: tripId, revieweeId, rating' },
        { status: 400 }
      );
    }

    // Check review eligibility
    const eligibility = await checkReviewEligibility(tripId, userId, 'TRAVELER');
    if (!eligibility.canReview) {
      return NextResponse.json(
        { success: false, error: eligibility.reason || 'Cannot review this trip' },
        { status: 400 }
      );
    }

    // Create the review
    const review = await createReview({
      tripId,
      reviewerId: userId,
      revieweeId,
      rating,
      comment,
      reviewerType: 'TRAVELER',
    });

    // Recalculate guide rating
    await recalculateGuideRating(revieweeId);

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    if (error instanceof ReviewValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'given' or 'received'

    let reviewsData;
    if (type === 'given') {
      reviewsData = await getReviewsGiven(userId);
    } else if (type === 'received') {
      reviewsData = await getReviewsReceived(userId);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type parameter. Must be "given" or "received"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      reviews: reviewsData,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
