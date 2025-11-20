import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { guides, guideDeclinations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tripId } = await params;

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

    // Create record in guideDeclinations table
    await db.insert(guideDeclinations).values({
      guideId: guide.id,
      tripId: tripId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Trip declined successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Decline trip error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
