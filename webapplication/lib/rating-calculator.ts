import { db } from '@/db/drizzle';
import { reviews, guides, travelers, users } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function recalculateGuideRating(guideUserId: string): Promise<void> {
  // Get the guide record - Fixed: should query guides table, not users
  const guide = await db.query.guides.findFirst({
    where: eq(guides.userId, guideUserId),
    with: {
      user: true,
    },
  });

  if (!guide) {
    console.error('Guide not found for userId:', guideUserId);
    throw new Error('Guide not found');
  }

  // Calculate average rating and count using aggregation
  const result = await db
    .select({
      avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.revieweeId, guideUserId),
        eq(reviews.reviewerType, 'TRAVELER')
      )
    );

  const avgRating = result[0]?.avgRating || 0;
  const count = result[0]?.count || 0;

  // Update the guide's rating and total reviews
  await db.update(guides)
    .set({
      rating: avgRating,
      totalReviews: count,
    })
    .where(eq(guides.userId, guideUserId));
}

export async function recalculateTravelerRating(travelerUserId: string): Promise<void> {
  // Get the traveler record - Fixed: should query travelers table, not users
  const traveler = await db.query.travelers.findFirst({
    where: eq(travelers.userId, travelerUserId),
    with: {
      user: true,
    },
  });

  if (!traveler) {
    console.error('Traveler not found for userId:', travelerUserId);
    throw new Error('Traveler not found');
  }

  // Calculate average rating and count using aggregation
  const result = await db
    .select({
      avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.revieweeId, travelerUserId),
        eq(reviews.reviewerType, 'GUIDE')
      )
    );

  const avgRating = result[0]?.avgRating || 0;
  const count = result[0]?.count || 0;

  // Update the traveler's rating and total reviews
  await db.update(travelers)
    .set({
      rating: avgRating,
      totalReviews: count,
    })
    .where(eq(travelers.userId, travelerUserId));
}

export async function recalculateRating(userId: string, userType: 'TRAVELER' | 'GUIDE'): Promise<void> {
  if (userType === 'GUIDE') {
    await recalculateGuideRating(userId);
  } else {
    await recalculateTravelerRating(userId);
  }
}
