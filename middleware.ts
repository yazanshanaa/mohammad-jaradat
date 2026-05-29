import { auth } from '@/lib/auth';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // 1. API Protection
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/dashboard')) {
    if (!req.auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Allow strict /api/admin only for SUPER_ADMIN if needed, but for now /api/admin is the Tenant API.
    // We refactored /api/admin/* to be Tenant Scoped, so it is safe for all users.
    // We should probably rename /api/admin to /api/dashboard to avoid confusion, but preserving for now.
    return NextResponse.next();
  }

  // 2. Auth Routes
  if (pathname === '/login') {
    if (req.auth) {
      return NextResponse.redirect(new URL('/dashboard/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // 3. Dashboard Protection (Tenant Area)
  if (pathname.startsWith('/dashboard')) {
    if (!req.auth) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 4. Admin Protection (Super Admin Area)
  if (pathname.startsWith('/admin')) {
    if (!req.auth) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const role = (req.auth.user as any)?.role;
    if (role !== 'SUPER_ADMIN') {
      // Redirect regular users to their dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // 5. Public Routes (i18n)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
