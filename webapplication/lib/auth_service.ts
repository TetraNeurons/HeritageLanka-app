// lib/auth_service.ts
import { db } from '@/db/drizzle';
import { users, travelers, guides, guideVerifications } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function createUser(data: {
  email: string;
  password: string;
  phone: string;
  name: string;
  role: 'TRAVELER' | 'GUIDE' | 'ADMIN';
  birthYear: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  languages: string[];
  country?: string;
  nic?: string;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 12);

  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      name: data.name,
      role: data.role,
      birthYear: data.birthYear,
      gender: data.gender,
      languages: data.languages,
    })
    .returning();

  // Only create extra profile for TRAVELER or GUIDE
  if (data.role === 'TRAVELER' && data.country) {
    await db.insert(travelers).values({
      userId: user.id,
      country: data.country,
    });
  }

  if (data.role === 'GUIDE' && data.nic && data.country) {
    const [guide] = await db.insert(guides).values({
      userId: user.id,
      nic: data.nic,
      // country not stored here? add column if needed
    }).returning();

    // Create verification record with PENDING status for new guides
    await db.insert(guideVerifications).values({
      guideId: guide.id,
      verificationStatus: 'PENDING',
    });
  }

  // ADMIN: No extra table needed → perfect for login

  return user;
}

export async function findUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email));
  return result[0] || null;
}

export async function verifyPassword(password: string, hashed: string) {
  return bcrypt.compare(password, hashed);
}

export async function getUserWithRole(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return null;

  let profile = null;

  if (user.role === 'TRAVELER') {
    [profile] = await db.select().from(travelers).where(eq(travelers.userId, userId));
  } else if (user.role === 'GUIDE') {
    [profile] = await db.select().from(guides).where(eq(guides.userId, userId));
  }

  return { ...user, profile };
}