import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { guides } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth';
import { getGuideVerificationStatus } from '@/lib/verification-service';

/**
 * GET /api/guider/verification-status
 * Get current guide's verification status
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

    // Check if user is a guide
    if (authResult.user.role !== 'GUIDE') {
      return NextResponse.json(
        { success: false, error: 'Only guides can access this endpoint' },
        { status: 403 }
      );
    }

    // Get guide record
    const guide = await db.query.guides.findFirst({
      where: eq(guides.userId, authResult.user.userId as string),
    });

    if (!guide) {
      return NextResponse.json(
        { success: false, error: 'Guide record not found' },
        { status: 404 }
      );
    }

    // Get verification status
    const verificationStatus = await getGuideVerificationStatus(guide.id);

    // Prepare response message based on status
    let message = '';
    if (verificationStatus.isLegacy) {
      message = 'Your account is verified (legacy account)';
    } else if (verificationStatus.status === 'PENDING') {
      message = 'Your account is pending verification. You will be notified once verified.';
    } else if (verificationStatus.status === 'VERIFIED') {
      message = 'Your account is verified. You can accept trip requests.';
    } else if (verificationStatus.status === 'REJECTED') {
      message = 'Your account verification was rejected.';
    }

    return NextResponse.json({
      success: true,
      verification: {
        status: verificationStatus.status,
        isLegacy: verificationStatus.isLegacy,
        message,
        rejectionReason: verificationStatus.rejectionReason,
        verifiedAt: verificationStatus.verifiedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verification status' },
      { status: 500 }
    );
  }
}
