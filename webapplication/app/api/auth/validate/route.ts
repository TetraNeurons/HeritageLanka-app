import {  NextResponse } from 'next/server';
import { getSession } from '@/lib/jwt';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false });
    }

    return NextResponse.json({ success: true, user: session });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
