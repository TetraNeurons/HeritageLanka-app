import { db } from '@/db/drizzle';
import { trips, reviews, travelers, guides } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export interface ReviewEligibility {
  canReview: boolean;
  hasReviewed: boolean;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
  };
  reason?: string;
}

export async function checkReviewEligibility(
  tripId: string,
  userId: string,
  userRole: 'TRAVELER' | 'GUIDE'
): Promise<ReviewEligibility> {
  // Fetch the trip with traveler and guide info
  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
    with: {
      traveler: true,
      guide: true,
    },
  });

  if (!trip) {
    return {
      canReview: false,
      hasReviewed: false,
      reason: 'Trip not found',
    };
  }

  // Check if trip status is COMPLETED or CANCELLED
  if (trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED') {
    return {
      canReview: false,
      hasReviewed: false,
      reason: 'Trip must be completed or cancelled to leave a review',
    };
  }

  // Check if trip has a guide
  if (!trip.guideId) {
    return {
      canReview: false,
      hasReviewed: false,
      reason: 'Trip has no guide assigned',
    };
  }

  // Check if user is participant in the trip
  const isTraveler = trip.traveler.userId === userId;
  const isGuide = trip.guide?.userId === userId;

  if (!isTraveler && !isGuide) {
    return {
      canReview: false,
      hasReviewed: false,
      reason: 'You are not a participant in this trip',
    };
  }

  // Check if user role matches their participation
  if (userRole === 'TRAVELER' && !isTraveler) {
    return {
      canReview: false,
      hasReviewed: false,
      reason: 'You are not the traveler for this trip',
    };
  }

  if (userRole === 'GUIDE' && !isGuide) {
    return {
      canReview: false,
      hasReviewed: false,
      reason: 'You are not the guide for this trip',
    };
  }

  // Check if user has already reviewed
  const existingReview = await db.query.reviews.findFirst({
    where: and(
      eq(reviews.tripId, tripId),
      eq(reviews.reviewerId, userId)
    ),
  });

  if (existingReview) {
    return {
      canReview: false,
      hasReviewed: true,
      existingReview: {
        id: existingReview.id,
        rating: existingReview.rating,
        comment: existingReview.comment,
        createdAt: existingReview.createdAt,
      },
      reason: 'You have already reviewed this trip',
    };
  }

  // All checks passed
  return {
    canReview: true,
    hasReviewed: false,
  };
}
