import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';
import { validateFile } from '@/lib/file-validation';
import { replaceProfileImage } from '@/lib/profile-storage';

/**
 * POST /api/profile/upload-image
 * Upload or replace profile image
 */
export async function POST(request: NextRequest) {
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Get existing profile to check for old image
    const existingProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    });

    // Upload new image (and delete old one if exists)
    const imageUrl = await replaceProfileImage(
      file,
      userId,
      existingProfile?.profileImageUrl
    );

    // Update or create profile record
    if (existingProfile) {
      await db
        .update(userProfiles)
        .set({
          profileImageUrl: imageUrl,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, userId));
    } else {
      await db.insert(userProfiles).values({
        userId,
        profileImageUrl: imageUrl,
      });
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      message: 'Profile image uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
