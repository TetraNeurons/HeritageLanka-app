// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '@/lib/auth_service';
import { createToken, setSession } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      phone,
      name,
      role: requestedRole, // user might send this
      birthYear,
      gender,
      languages,
      country,
      nic,
    } = body;

    // === Basic required fields ===
    if (!email || !password || !phone || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, phone, name' },
        { status: 400 }
      );
    }

    if (!birthYear || !gender || !languages || !Array.isArray(languages) || languages.length === 0) {
      return NextResponse.json(
        { error: 'birthYear, gender, and at least one language are required' },
        { status: 400 }
      );
    }

    // === Age validation ===
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    if (age < 18 || age > 120) {
      return NextResponse.json(
        { error: 'You must be between 18 and 120 years old' },
        { status: 400 }
      );
    }

    // === Gender validation ===
    const validGenders = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] as const;
    if (!validGenders.includes(gender)) {
      return NextResponse.json({ error: 'Invalid gender' }, { status: 400 });
    }

    // === ADMIN ROLE LOGIC (Critical Fix) ===
    let role: 'TRAVELER' | 'GUIDE' | 'ADMIN' = 'TRAVELER';

    if (email.endsWith('@hl.com')) {
      role = 'ADMIN'; // Auto-promote @hl.com to ADMIN
    } else if (requestedRole === 'ADMIN') {
      return NextResponse.json(
        { error: 'Only @hl.com emails can register as Admin' },
        { status: 403 }
      );
    } else {
      role = requestedRole === 'GUIDE' ? 'GUIDE' : 'TRAVELER';
    }

    // === Role-specific validations ===
    if (role === 'TRAVELER' && !country) {
      return NextResponse.json(
        { error: 'Country is required for travelers' },
        { status: 400 }
      );
    }

    if (role === 'GUIDE') {
      if (!country || !nic) {
        return NextResponse.json(
          { error: 'Country and NIC are required for guides' },
          { status: 400 }
        );
      }
    }

    // === Password strength ===
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // === Check if email already exists ===
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // === Create user ===
    const user = await createUser({
      email,
      password,
      phone,
      name,
      role,
      birthYear: Number(birthYear),
      gender,
      languages,
      country: country || undefined,
      nic: nic || undefined,
    });

    // === Generate JWT & set session ===
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await setSession(token);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}