import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/jwt';
import { db } from '@/db/drizzle';
import { 
  users, 
  travelers, 
  guides, 
  userProfiles, 
  guideVerifications,
  trips,
  reviews,
  payments,
  eventTickets,
  apiUsageLogs,
  aiUsageLogs,
  guideDeclinations,
  tripVerifications
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import { deleteImageFromStorage } from '@/lib/storage-utils';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.userId;

    // Start a transaction to ensure data consistency
    await db.transaction(async (tx) => {
      // Get user profile to delete profile image if exists
      const userProfile = await tx
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .limit(1);

      // Delete profile image from storage if exists
      if (userProfile[0]?.profileImageUrl) {
        try {
          await deleteImageFromStorage(userProfile[0].profileImageUrl);
        } catch (error) {
          console.error('Failed to delete profile image:', error);
          // Continue with deletion even if image deletion fails
        }
      }

      // Get traveler and guide IDs for cascade deletion
      const traveler = await tx
        .select({ id: travelers.id })
        .from(travelers)
        .where(eq(travelers.userId, userId))
        .limit(1);

      const guide = await tx
        .select({ id: guides.id })
        .from(guides)
        .where(eq(guides.userId, userId))
        .limit(1);

      const travelerId = traveler[0]?.id;
      const guideId = guide[0]?.id;

      // Delete in proper order to respect foreign key constraints

      // 1. Delete trip verifications for trips associated with this user
      if (travelerId) {
        const userTrips = await tx
          .select({ id: trips.id })
          .from(trips)
          .where(eq(trips.travelerId, travelerId));
        
        for (const trip of userTrips) {
          await tx.delete(tripVerifications).where(eq(tripVerifications.tripId, trip.id));
        }
      }

      // 2. Delete guide declinations
      if (guideId) {
        await tx.delete(guideDeclinations).where(eq(guideDeclinations.guideId, guideId));
      }

      // 3. Delete event tickets
      if (travelerId) {
        await tx.delete(eventTickets).where(eq(eventTickets.travelerId, travelerId));
      }

      // 4. Delete payments (will cascade to related records)
      if (travelerId) {
        await tx.delete(payments).where(eq(payments.travelerId, travelerId));
      }

      // 5. Delete reviews (both as reviewer and reviewee)
      await tx.delete(reviews).where(eq(reviews.reviewerId, userId));
      await tx.delete(reviews).where(eq(reviews.revieweeId, userId));

      // 6. Delete trips (will cascade to trip locations)
      if (travelerId) {
        await tx.delete(trips).where(eq(trips.travelerId, travelerId));
      }
      if (guideId) {
        await tx.delete(trips).where(eq(trips.guideId, guideId));
      }

      // 7. Delete usage logs
      await tx.delete(apiUsageLogs).where(eq(apiUsageLogs.userId, userId));
      await tx.delete(aiUsageLogs).where(eq(aiUsageLogs.userId, userId));

      // 8. Delete guide verification
      if (guideId) {
        await tx.delete(guideVerifications).where(eq(guideVerifications.guideId, guideId));
      }

      // 9. Delete user profile
      await tx.delete(userProfiles).where(eq(userProfiles.userId, userId));

      // 10. Delete traveler/guide records
      if (travelerId) {
        await tx.delete(travelers).where(eq(travelers.id, travelerId));
      }
      if (guideId) {
        await tx.delete(guides).where(eq(guides.id, guideId));
      }

      // 11. Finally, delete the user record
      await tx.delete(users).where(eq(users.id, userId));
    });

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Profile deletion error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete account. Please try again or contact support.' 
      },
      { status: 500 }
    );
  }
}