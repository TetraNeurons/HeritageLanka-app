import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, verifyPassword } from '@/lib/auth_service';
import { createToken, setSession } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create token and set session
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await setSession(token);

    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      } 
    });
  } catch (error: any) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}