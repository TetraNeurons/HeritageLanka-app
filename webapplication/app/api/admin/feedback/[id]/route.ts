import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { systemFeedback } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';

// PATCH - Update feedback status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isApproved, isPublic } = body;

    const updates: any = { updatedAt: new Date() };
    if (typeof isApproved === 'boolean') updates.isApproved = isApproved;
    if (typeof isPublic === 'boolean') updates.isPublic = isPublic;

    const [updated] = await db
      .update(systemFeedback)
      .set(updates)
      .where(eq(systemFeedback.id, id))
      .returning();

    return NextResponse.json({ feedback: updated });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}
