import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/jwt';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Prevent self-deletion
  if (session.userId === userId) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 400 }
    );
  }

  try {
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // This will cascade delete traveler/guide/reviews/trips etc. thanks to your ON DELETE CASCADE
    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete user error:', error);

    // If there are active trips/bookings that block deletion
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'Cannot delete user: they have active trips or bookings' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}