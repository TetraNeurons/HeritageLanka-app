import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  // Public routes
  if (pathname === '/auth/signin' || pathname === '/auth/signup') {
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        // Redirect authenticated users to their dashboard
        const dashboardUrl = getRoleDashboard(payload.role);
        return NextResponse.redirect(new URL(dashboardUrl, request.url));
      }
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  const payload = await verifyToken(token);
  
  if (!payload) {
    const response = NextResponse.redirect(new URL('/auth/signin', request.url));
    response.cookies.delete('token');
    return response;
  }

  // Redirect /dashboard to role-specific dashboard
  if (pathname === '/dashboard') {
    const dashboardUrl = getRoleDashboard(payload.role);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Role-based access control
  if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
    const dashboardUrl = getRoleDashboard(payload.role);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  if (pathname.startsWith('/guide') && payload.role !== 'GUIDE') {
    const dashboardUrl = getRoleDashboard(payload.role);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  if (pathname.startsWith('/traveler') && payload.role !== 'TRAVELER') {
    const dashboardUrl = getRoleDashboard(payload.role);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  return NextResponse.next();
}

function getRoleDashboard(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'GUIDE':
      return '/guide/dashboard';
    case 'TRAVELER':
      return '/traveler/dashboard';
    default:
      return '/traveler/dashboard';
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/guide/:path*',
    '/traveler/:path*',
    '/auth/signin',
    '/auth/signup',
  ],
};