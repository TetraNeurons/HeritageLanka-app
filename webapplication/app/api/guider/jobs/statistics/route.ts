import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { trips, guides } from '@/db/schema';
import { eq, and, or, count } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Authenticate and verify guide role
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.role !== 'GUIDE') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Guide role required' },
        { status: 403 }
      );
    }

    // Get guide profile for authenticated user
    const [guide] = await db
      .select()
      .from(guides)
      .where(eq(guides.userId, session.userId))
      .limit(1);

    if (!guide) {
      return NextResponse.json(
        { success: false, error: 'Guide profile not found' },
        { status: 404 }
      );
    }

    // Count in-progress trips
    const [inProgressResult] = await db
      .select({ count: count() })
      .from(trips)
      .where(
        and(
          eq(trips.guideId, guide.id),
          eq(trips.status, 'IN_PROGRESS')
        )
      );

    // Count completed trips
    const [completedResult] = await db
      .select({ count: count() })
      .from(trips)
      .where(
        and(
          eq(trips.guideId, guide.id),
          eq(trips.status, 'COMPLETED')
        )
      );

    // Count cancelled trips
    const [cancelledResult] = await db
      .select({ count: count() })
      .from(trips)
      .where(
        and(
          eq(trips.guideId, guide.id),
          eq(trips.status, 'CANCELLED')
        )
      );

    // Count total trips
    const [totalResult] = await db
      .select({ count: count() })
      .from(trips)
      .where(eq(trips.guideId, guide.id));

    const statistics = {
      inProgressCount: inProgressResult.count,
      completedCount: completedResult.count,
      cancelledCount: cancelledResult.count,
      totalTrips: totalResult.count,
    };

    return NextResponse.json(
      {
        success: true,
        statistics,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get job statistics error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
