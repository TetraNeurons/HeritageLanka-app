import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { reviews } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const reviewerType = searchParams.get('reviewerType');
    const minRating = searchParams.get('minRating');
    const maxRating = searchParams.get('maxRating');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build filter conditions
    const conditions = [];
    
    if (userId) {
      conditions.push(eq(reviews.revieweeId, userId));
    }
    
    if (reviewerType && (reviewerType === 'TRAVELER' || reviewerType === 'GUIDE')) {
      conditions.push(eq(reviews.reviewerType, reviewerType));
    }
    
    if (minRating) {
      conditions.push(gte(reviews.rating, parseInt(minRating)));
    }
    
    if (maxRating) {
      conditions.push(lte(reviews.rating, parseInt(maxRating)));
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch reviews with filters
    const reviewsData = await db.query.reviews.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        reviewer: true,
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
      limit,
      offset,
    });

    // Get total count for pagination
    const totalReviews = await db.query.reviews.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
    });

    return NextResponse.json({
      success: true,
      reviews: reviewsData,
      pagination: {
        page,
        limit,
        total: totalReviews.length,
        totalPages: Math.ceil(totalReviews.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
