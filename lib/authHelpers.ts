import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';

type AuthenticatedUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

type AuthenticatedSession = Session & {
  user: AuthenticatedUser;
};

/**
 * Validates session exists and has an ADMIN or SUPER_ADMIN role.
 * Returns a NextResponse error if unauthorized, or null if OK.
 */
export function requireAdmin(
  session: Session | null
): NextResponse | null {
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user as AuthenticatedUser).role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

/**
 * Validates session exists (any authenticated user).
 * Returns a NextResponse error if unauthenticated, or null if OK.
 */
export function requireAuth(
  session: Session | null
): NextResponse | null {
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

/**
 * Extracts the authenticated user with role, after requireAdmin passes.
 */
export function getAdminUser(session: Session): AuthenticatedSession {
  return session as AuthenticatedSession;
}
