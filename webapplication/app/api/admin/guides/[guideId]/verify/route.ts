import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { verifyGuide } from '@/lib/verification-service';

/**
 * POST /api/admin/guides/[guideId]/verify
 * Verify a guide
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

    // Verify the guide
    await verifyGuide(guideId, authResult.user.userId as string);

    return NextResponse.json({
      success: true,
      message: 'Guide verified successfully',
    });
  } catch (error) {
    console.error('Error verifying guide:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify guide' },
      { status: 500 }
    );
  }
}
