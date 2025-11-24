import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { reviews } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { recalculateGuideRating, recalculateTravelerRating } from '@/lib/rating-calculator';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;
    const { id: reviewId } = await params;

    // Fetch the review to check ownership
    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user is the reviewer
    if (review.reviewerId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own reviews' },
        { status: 403 }
      );
    }

    // Store reviewee info before deletion for rating recalculation
    const revieweeId = review.revieweeId;
    const reviewerType = review.reviewerType;

    // Delete the review
    await db.delete(reviews).where(eq(reviews.id, reviewId));

    // Recalculate reviewee rating
    if (reviewerType === 'TRAVELER') {
      await recalculateGuideRating(revieweeId);
    } else {
      await recalculateTravelerRating(revieweeId);
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
