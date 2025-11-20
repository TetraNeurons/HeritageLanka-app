import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { users, travelers, guides, reviews } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { getSession } from '@/lib/jwt'; // ← your file above

// GET /api/admin/users
export async function GET() {
  const session = await getSession();

  // Only ADMIN can access
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        gender: users.gender,
        createdAt: users.createdAt,

        // Optional traveler data
        travelerCountry: travelers.country,
        travelerRating: travelers.rating,
        travelerTotalReviews: travelers.totalReviews,

        // Optional guide data
        guideRating: guides.rating,
        guideTotalReviews: guides.totalReviews,
      })
      .from(users)
      .leftJoin(travelers, eq(travelers.userId, users.id))
      .leftJoin(guides, eq(guides.userId, users.id))
      .orderBy(users.createdAt);

    // Fetch review sentiment data for all users
    const reviewSentimentPromises = allUsers.map(async (u) => {
      const positiveReviews = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(reviews)
        .where(and(eq(reviews.revieweeId, u.id), gte(reviews.rating, 4)));
      
      const negativeReviews = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(reviews)
        .where(and(eq(reviews.revieweeId, u.id), sql`${reviews.rating} < 4`));
      
      return {
        userId: u.id,
        positiveCount: positiveReviews[0]?.count || 0,
        negativeCount: negativeReviews[0]?.count || 0,
      };
    });

    const reviewSentiments = await Promise.all(reviewSentimentPromises);
    const sentimentMap = new Map(reviewSentiments.map(s => [s.userId, s]));

    // Transform + calculate stats
    const transformedUsers = allUsers.map((u) => {
      const sentiment = sentimentMap.get(u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        gender: u.gender ?? undefined,
        createdAt: u.createdAt.toISOString(),
        travelerData: u.travelerCountry ? { 
          country: u.travelerCountry,
          rating: Number(u.travelerRating ?? 0),
          totalReviews: u.travelerTotalReviews ?? 0,
          positiveReviews: sentiment?.positiveCount || 0,
          negativeReviews: sentiment?.negativeCount || 0,
        } : undefined,
        guideData:
          u.guideRating !== null && u.guideRating !== undefined
            ? { 
                rating: Number(u.guideRating), 
                totalReviews: u.guideTotalReviews,
                positiveReviews: sentiment?.positiveCount || 0,
                negativeReviews: sentiment?.negativeCount || 0,
              }
            : undefined,
      };
    });

    const stats = transformedUsers.reduce(
      (acc, user) => {
        acc.totalUsers++;
        if (user.role === 'TRAVELER') acc.totalTravelers++;
        if (user.role === 'GUIDE') acc.totalGuides++;
        if (user.role === 'ADMIN') acc.totalAdmins++;
        return acc;
      },
      { totalUsers: 0, totalTravelers: 0, totalGuides: 0, totalAdmins: 0 }
    );

    return NextResponse.json({ users: transformedUsers, stats });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}