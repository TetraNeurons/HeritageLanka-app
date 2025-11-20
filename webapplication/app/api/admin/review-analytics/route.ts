import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { reviews, guides, travelers, users } from '@/db/schema';
import { sql, desc, gte } from 'drizzle-orm';

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

    // Check if user is an admin
    if (authResult.payload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Only admins can access this endpoint' },
        { status: 403 }
      );
    }

    // Calculate total reviews
    const totalReviewsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(reviews);
    const totalReviews = totalReviewsResult[0]?.count || 0;

    // Calculate average rating
    const avgRatingResult = await db
      .select({ avg: sql<number>`COALESCE(AVG(${reviews.rating}), 0)` })
      .from(reviews);
    const averageRating = avgRatingResult[0]?.avg || 0;

    // Calculate positive percentage (rating >= 4)
    const positiveReviewsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(reviews)
      .where(gte(reviews.rating, 4));
    const positiveReviews = positiveReviewsResult[0]?.count || 0;
    const positivePercentage = totalReviews > 0 ? (positiveReviews / totalReviews) * 100 : 0;

    // Get reviews per month for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const reviewsPerMonthResult = await db
      .select({
        month: sql<string>`TO_CHAR(${reviews.createdAt}, 'YYYY-MM')`,
        count: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(gte(reviews.createdAt, sixMonthsAgo))
      .groupBy(sql`TO_CHAR(${reviews.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${reviews.createdAt}, 'YYYY-MM')`);

    // Get top 10 rated guides
    const topRatedGuidesResult = await db
      .select({
        guideId: guides.id,
        userId: guides.userId,
        name: users.name,
        rating: guides.rating,
        totalReviews: guides.totalReviews,
      })
      .from(guides)
      .innerJoin(users, sql`${guides.userId} = ${users.id}`)
      .where(gte(guides.totalReviews, 1))
      .orderBy(desc(guides.rating))
      .limit(10);

    // Get 10 lowest rated travelers (with at least 1 review)
    const lowestRatedTravelersResult = await db
      .select({
        travelerId: travelers.id,
        userId: travelers.userId,
        name: users.name,
        rating: travelers.rating,
        totalReviews: travelers.totalReviews,
      })
      .from(travelers)
      .innerJoin(users, sql`${travelers.userId} = ${users.id}`)
      .where(gte(travelers.totalReviews, 1))
      .orderBy(travelers.rating)
      .limit(10);

    return NextResponse.json({
      success: true,
      analytics: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        positivePercentage: Math.round(positivePercentage * 10) / 10,
        reviewsPerMonth: reviewsPerMonthResult,
        topRatedGuides: topRatedGuidesResult,
        lowestRatedTravelers: lowestRatedTravelersResult,
      },
    });
  } catch (error) {
    console.error('Error fetching review analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
