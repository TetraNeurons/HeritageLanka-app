import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { users, travelers, guides } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/jwt'; // ← your file above

// GET /api/admin/users
export async function GET() {
  const session = await getSession();

  // Only ADMIN can access
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        gender: users.gender,
        createdAt: users.createdAt,

        // Optional traveler data
        travelerCountry: travelers.country,

        // Optional guide data
        guideRating: guides.rating,
        guideTotalReviews: guides.totalReviews,
      })
      .from(users)
      .leftJoin(travelers, eq(travelers.userId, users.id))
      .leftJoin(guides, eq(guides.userId, users.id))
      .orderBy(users.createdAt);

    // Transform + calculate stats
    const transformedUsers = allUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      gender: u.gender ?? undefined,
      createdAt: u.createdAt.toISOString(),
      travelerData: u.travelerCountry ? { country: u.travelerCountry } : undefined,
      guideData:
        u.guideRating !== null && u.guideRating !== undefined
          ? { rating: Number(u.guideRating), totalReviews: u.guideTotalReviews }
          : undefined,
    }));

    const stats = transformedUsers.reduce(
      (acc, user) => {
        acc.totalUsers++;
        if (user.role === 'TRAVELER') acc.totalTravelers++;
        if (user.role === 'GUIDE') acc.totalGuides++;
        if (user.role === 'ADMIN') acc.totalAdmins++;
        return acc;
      },
      { totalUsers: 0, totalTravelers: 0, totalGuides: 0, totalAdmins: 0 }
    );

    return NextResponse.json({ users: transformedUsers, stats });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}