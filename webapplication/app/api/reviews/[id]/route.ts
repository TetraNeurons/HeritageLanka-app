import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { updateReview, ReviewValidationError } from '@/lib/review-service';
import { db } from '@/db/drizzle';
import { reviews } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { recalculateGuideRating, recalculateTravelerRating } from '@/lib/rating-calculator';

export async function PATCH(
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

    // Check if user is a traveler or guide
    if (authResult.payload.role !== 'TRAVELER' && authResult.payload.role !== 'GUIDE') {
      return NextResponse.json(
        { success: false, error: 'Only travelers and guides can edit reviews' },
        { status: 403 }
      );
    }

    const userId = authResult.payload.userId;
    const reviewId = params.id;
    const body = await request.json();
    const { rating, comment } = body;

    // Get the existing review to check if rating changed
    const existingReview = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    const ratingChanged = rating !== undefined && rating !== existingReview.rating;

    // Update the review
    const updatedReview = await updateReview(
      {
        reviewId,
        rating,
        comment,
      },
      userId
    );

    // Recalculate reviewee rating if rating changed
    if (ratingChanged) {
      if (existingReview.reviewerType === 'TRAVELER') {
        await recalculateGuideRating(existingReview.revieweeId);
      } else {
        await recalculateTravelerRating(existingReview.revieweeId);
      }
    }

    return NextResponse.json({
      success: true,
      review: updatedReview,
    });
  } catch (error) {
    if (error instanceof ReviewValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
