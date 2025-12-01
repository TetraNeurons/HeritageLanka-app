import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { users, userProfiles, travelers, guides } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';

/**
 * GET /api/profile/me
 * Get current user's profile for editing
 */
export async function GET(request: NextRequest) {
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

    if (user.role === 'TRAVELER') {
      const traveler = await db.query.travelers.findFirst({
        where: eq(travelers.userId, userId),
      });
      if (traveler) {
        roleData = {
          country: traveler.country,
        };
      }
    } else if (user.role === 'GUIDE') {
      const guide = await db.query.guides.findFirst({
        where: eq(guides.userId, userId),
      });
      if (guide) {
        roleData = {
          nic: guide.nic,
        };
      }
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        birthYear: user.birthYear,
        gender: user.gender,
        languages: user.languages,
        profileImageUrl: profile?.profileImageUrl || null,
        bio: profile?.bio || null,
        roleData,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile/me
 * Update current user's profile
 */
export async function PUT(request: NextRequest) {
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
    const body = await request.json();

    const { name, phone, bio, languages } = body;

    // Validate bio length
    if (bio && bio.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Bio must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Update user table if name, phone, or languages changed
    if (name || phone || languages) {
      const updateData: any = {};
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      if (languages) updateData.languages = languages;
      updateData.updatedAt = new Date();

      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId));
    }

    // Update or create profile record for bio
    if (bio !== undefined) {
      // Check if profile exists
      const existingProfile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, userId),
      });

      if (existingProfile) {
        // Update existing profile
        await db
          .update(userProfiles)
          .set({
            bio,
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.userId, userId));
      } else {
        // Create new profile
        await db.insert(userProfiles).values({
          userId,
          bio,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
