import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { rejectGuide } from '@/lib/verification-service';

/**
 * POST /api/admin/guides/[guideId]/reject
 * Reject a guide
 * Admin only
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ guideId: string }> }
) {
  try {
    // Verify authentication and admin role
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (authResult.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { guideId } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // Reject the guide
    await rejectGuide(guideId, authResult.user.userId as string, reason);

    return NextResponse.json({
      success: true,
      message: 'Guide rejected successfully',
    });
  } catch (error) {
    console.error('Error rejecting guide:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reject guide' },
      { status: 500 }
    );
  }
}
