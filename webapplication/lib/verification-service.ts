import { db } from '@/db/drizzle';
import { guides, guideVerifications, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Guide verification service
 * Handles guide verification status queries and updates
 */

export interface VerificationStatus {
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  isLegacy: boolean;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  rejectionReason: string | null;
}

/**
 * Get verification status for a guide
 * Legacy guides (no verification record) are automatically considered VERIFIED
 * @param guideId - Guide ID
 * @returns VerificationStatus object
 */
export async function getGuideVerificationStatus(
  guideId: string
): Promise<VerificationStatus> {
  const verification = await db.query.guideVerifications.findFirst({
    where: eq(guideVerifications.guideId, guideId),
  });

  // If no verification record exists, this is a legacy guide
  // Legacy guides are automatically considered VERIFIED
  if (!verification) {
    return {
      status: 'VERIFIED',
      isLegacy: true,
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null,
    };
  }

  // New guides have explicit verification records
  return {
    status: verification.verificationStatus,
    isLegacy: false,
    verifiedAt: verification.verifiedAt,
    verifiedBy: verification.verifiedBy,
    rejectionReason: verification.rejectionReason,
  };
}

/**
 * Check if a guide can accept trips
 * @param guideId - Guide ID
 * @returns true if guide can accept trips, false otherwise
 */
export async function canGuideAcceptTrips(guideId: string): Promise<boolean> {
  const status = await getGuideVerificationStatus(guideId);
  
  // Legacy guides and verified guides can accept trips
  // Pending and rejected guides cannot
  return status.status === 'VERIFIED';
}

/**
 * Create a verification record for a new guide
 * @param guideId - Guide ID
 */
export async function createPendingVerification(guideId: string): Promise<void> {
  await db.insert(guideVerifications).values({
    guideId,
    verificationStatus: 'PENDING',
  });
}

/**
 * Verify a guide (admin action)
 * @param guideId - Guide ID
 * @param adminId - Admin user ID
 */
export async function verifyGuide(
  guideId: string,
  adminId: string
): Promise<void> {
  // Check if verification record exists
  const existing = await db.query.guideVerifications.findFirst({
    where: eq(guideVerifications.guideId, guideId),
  });

  if (!existing) {
    // Create new verification record for legacy guide
    await db.insert(guideVerifications).values({
      guideId,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      verifiedBy: adminId,
    });
  } else {
    // Update existing record
    await db
      .update(guideVerifications)
      .set({
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedBy: adminId,
        rejectionReason: null, // Clear rejection reason if previously rejected
        updatedAt: new Date(),
      })
      .where(eq(guideVerifications.guideId, guideId));
  }
}

/**
 * Reject a guide (admin action)
 * @param guideId - Guide ID
 * @param adminId - Admin user ID
 * @param reason - Rejection reason
 */
export async function rejectGuide(
  guideId: string,
  adminId: string,
  reason: string
): Promise<void> {
  if (!reason || reason.trim().length === 0) {
    throw new Error('Rejection reason is required');
  }

  // Check if verification record exists
  const existing = await db.query.guideVerifications.findFirst({
    where: eq(guideVerifications.guideId, guideId),
  });

  if (!existing) {
    // Create new verification record for legacy guide
    await db.insert(guideVerifications).values({
      guideId,
      verificationStatus: 'REJECTED',
      verifiedBy: adminId,
      rejectionReason: reason,
    });
  } else {
    // Update existing record
    await db
      .update(guideVerifications)
      .set({
        verificationStatus: 'REJECTED',
        verifiedBy: adminId,
        rejectionReason: reason,
        verifiedAt: null, // Clear verified date
        updatedAt: new Date(),
      })
      .where(eq(guideVerifications.guideId, guideId));
  }
}

/**
 * Get all guides with their verification status
 * @param statusFilter - Optional filter by verification status
 * @returns Array of guides with user and verification data
 */
export async function getAllGuidesWithVerification(
  statusFilter?: 'PENDING' | 'VERIFIED' | 'REJECTED'
) {
  // Get all guides with their user data
  const allGuides = await db.query.guides.findMany({
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          phone: true,
          languages: true,
          createdAt: true,
        },
      },
      verification: true,
    },
  });

  // Map guides with verification status
  const guidesWithStatus = allGuides.map(guide => {
    const verification = guide.verification;
    
    // Legacy guides without verification record
    if (!verification) {
      return {
        ...guide,
        verificationStatus: 'VERIFIED' as const,
        isLegacy: true,
        verifiedAt: null,
        verifiedBy: null,
        rejectionReason: null,
      };
    }

    // Guides with verification record
    return {
      ...guide,
      verificationStatus: verification.verificationStatus,
      isLegacy: false,
      verifiedAt: verification.verifiedAt,
      verifiedBy: verification.verifiedBy,
      rejectionReason: verification.rejectionReason,
    };
  });

  // Apply filter if provided
  if (statusFilter) {
    return guidesWithStatus.filter(g => g.verificationStatus === statusFilter);
  }

  return guidesWithStatus;
}
