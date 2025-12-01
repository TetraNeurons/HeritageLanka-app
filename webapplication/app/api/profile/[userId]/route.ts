import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { users, userProfiles, travelers, guides, reviews, trips, guideVerifications } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';

/**
 * GET /api/profile/[userId]
 * Get public profile for any user
 * Requires authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
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

    const { userId } = await params;

    // Get user data
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get profile data (may not exist for legacy users)
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    });

    // Get role-specific data
    let roleData: any = null;
    let completedTrips = 0;

    if (user.role === 'TRAVELER') {
      const traveler = await db.query.travelers.findFirst({
        where: eq(travelers.userId, userId),
      });

      if (traveler) {
        // Count completed trips
        const tripCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(trips)
          .where(
            and(
              eq(trips.travelerId, traveler.id),
              eq(trips.status, 'COMPLETED')
            )
          );

        completedTrips = Number(tripCount[0]?.count || 0);

        roleData = {
          country: traveler.country,
          rating: traveler.rating,
          totalReviews: traveler.totalReviews,
          completedTrips,
        };
      }
    } else if (user.role === 'GUIDE') {
      const guide = await db.query.guides.findFirst({
        where: eq(guides.userId, userId),
      });

      if (guide) {
        // Count completed trips
        const tripCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(trips)
          .where(
            and(
              eq(trips.guideId, guide.id),
              eq(trips.status, 'COMPLETED')
            )
          );

        completedTrips = Number(tripCount[0]?.count || 0);

        // Get verification status (legacy guides without record are considered verified)
        const verification = await db.query.guideVerifications.findFirst({
          where: eq(guideVerifications.guideId, guide.id),
        });

        roleData = {
          rating: guide.rating,
          totalReviews: guide.totalReviews,
          completedTrips,
          verificationStatus: verification?.verificationStatus || 'VERIFIED',
          isLegacyVerified: !verification, // True if no verification record exists
          verifiedAt: verification?.verifiedAt || null,
        };
      }
    }

    // Get reviews (as reviewee)
    const userReviews = await db.query.reviews.findMany({
      where: eq(reviews.revieweeId, userId),
      with: {
        reviewer: {
          columns: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
      limit: 10, // Latest 10 reviews
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        name: user.name,
        role: user.role,
        languages: user.languages,
        profileImageUrl: profile?.profileImageUrl || null,
        bio: profile?.bio || null,
        createdAt: user.createdAt,
        roleData,
        reviews: userReviews.map(review => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          reviewerName: review.reviewer.name,
          reviewerRole: review.reviewer.role,
          createdAt: review.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
