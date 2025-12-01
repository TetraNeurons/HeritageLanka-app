import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';
import { deleteProfileImage } from '@/lib/profile-storage';

/**
 * DELETE /api/profile/image
 * Delete current user's profile image
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId as string;

    // Get existing profile
    const existingProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    });

    if (!existingProfile || !existingProfile.profileImageUrl) {
      return NextResponse.json(
        { success: false, error: 'No profile image to delete' },
        { status: 404 }
      );
    }

    // Delete image from storage
    await deleteProfileImage(existingProfile.profileImageUrl);

    // Update profile record to remove image URL
    await db
      .update(userProfiles)
      .set({
        profileImageUrl: null,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId));

    return NextResponse.json({
      success: true,
      message: 'Profile image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting profile image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
