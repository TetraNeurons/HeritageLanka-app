import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getAllGuidesWithVerification } from '@/lib/verification-service';

/**
 * GET /api/admin/guides/pending
 * Get all guides (with optional status filter)
 * Admin only
 */
export async function GET(request: NextRequest) {
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

    // Get status filter from query params
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') as 'PENDING' | 'VERIFIED' | 'REJECTED' | null;

    // Get guides with verification status
    const guides = await getAllGuidesWithVerification(statusFilter || undefined);

    // Format response
    const formattedGuides = guides.map(guide => ({
      id: guide.id,
      userId: guide.userId,
      name: guide.user.name,
      email: guide.user.email,
      phone: guide.user.phone,
      languages: guide.user.languages,
      nic: guide.nic,
      rating: guide.rating,
      totalReviews: guide.totalReviews,
      createdAt: guide.user.createdAt,
      verificationStatus: guide.verificationStatus,
      isLegacy: guide.isLegacy,
      verifiedAt: guide.verifiedAt,
      verifiedBy: guide.verifiedBy,
      rejectionReason: guide.rejectionReason,
    }));

    return NextResponse.json({
      success: true,
      guides: formattedGuides,
    });
  } catch (error) {
    console.error('Error fetching guides:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch guides' },
      { status: 500 }
    );
  }
}
