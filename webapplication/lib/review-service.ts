import { db } from '@/db/drizzle';
import { reviews } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface CreateReviewInput {
  tripId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  reviewerType: 'TRAVELER' | 'GUIDE';
}

export interface UpdateReviewInput {
  reviewId: string;
  rating?: number;
  comment?: string;
}

export class ReviewValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReviewValidationError';
  }
}

function validateRating(rating: number): void {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ReviewValidationError('Rating must be an integer between 1 and 5');
  }
}

function validateComment(comment?: string): void {
  if (comment && comment.length > 500) {
    throw new ReviewValidationError('Comment must not exceed 500 characters');
  }
}

export async function createReview(input: CreateReviewInput) {
  // Validate rating
  validateRating(input.rating);
  
  // Validate comment
  validateComment(input.comment);

  // Check for duplicate review
  const existingReview = await getReviewByTripAndReviewer(input.tripId, input.reviewerId);
  if (existingReview) {
    throw new ReviewValidationError('You have already reviewed this trip');
  }

  // Create the review
  const [review] = await db.insert(reviews).values({
    tripId: input.tripId,
    reviewerId: input.reviewerId,
    revieweeId: input.revieweeId,
    rating: input.rating,
    comment: input.comment || null,
    reviewerType: input.reviewerType,
  }).returning();

  return review;
}

export async function updateReview(input: UpdateReviewInput, userId: string) {
  // Fetch the existing review
  const existingReview = await db.query.reviews.findFirst({
    where: eq(reviews.id, input.reviewId),
  });

  if (!existingReview) {
    throw new ReviewValidationError('Review not found');
  }

  // Check ownership
  if (existingReview.reviewerId !== userId) {
    throw new ReviewValidationError('You can only edit your own reviews');
  }

  // Validate new rating if provided
  if (input.rating !== undefined) {
    validateRating(input.rating);
  }

  // Validate new comment if provided
  if (input.comment !== undefined) {
    validateComment(input.comment);
  }

  // Update the review
  const [updatedReview] = await db.update(reviews)
    .set({
      ...(input.rating !== undefined && { rating: input.rating }),
      ...(input.comment !== undefined && { comment: input.comment || null }),
      updatedAt: new Date(),
    })
    .where(eq(reviews.id, input.reviewId))
    .returning();

  return updatedReview;
}

export async function getReviewsGiven(userId: string) {
  const userReviews = await db.query.reviews.findMany({
    where: eq(reviews.reviewerId, userId),
    with: {
      reviewee: true,
      trip: {
        with: {
          traveler: {
            with: {
              user: true,
            },
          },
          guide: {
            with: {
              user: true,
            },
          },
        },
      },
    },
    orderBy: [desc(reviews.createdAt)],
  });

  return userReviews;
}

export async function getReviewsReceived(userId: string) {
  const userReviews = await db.query.reviews.findMany({
    where: eq(reviews.revieweeId, userId),
    with: {
      reviewer: true,
      trip: {
        with: {
          traveler: {
            with: {
              user: true,
            },
          },
          guide: {
            with: {
              user: true,
            },
          },
        },
      },
    },
    orderBy: [desc(reviews.createdAt)],
  });

  return userReviews;
}

export async function getReviewByTripAndReviewer(tripId: string, reviewerId: string) {
  const review = await db.query.reviews.findFirst({
    where: and(
      eq(reviews.tripId, tripId),
      eq(reviews.reviewerId, reviewerId)
    ),
  });

  return review;
}
