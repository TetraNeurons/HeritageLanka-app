import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { systemFeedback } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';

// GET - Fetch all feedback (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const feedbacks = await db
      .select()
      .from(systemFeedback)
      .orderBy(desc(systemFeedback.createdAt));

    return NextResponse.json({ feedbacks });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedbacks' },
      { status: 500 }
    );
  }
}
