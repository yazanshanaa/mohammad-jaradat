import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export interface TenantContext {
  userId: string;
  user: {
    id: string;
    email: string;
    role: string;
    plan: string;
    stripeCustomerId?: string | null;
  };
}

/**
 * Higher-order function/helper to protect API routes with strict tenant isolation.
 * Verifies authentication and returns the scoped user context.
 */
export async function getTenant(): Promise<TenantContext | NextResponse> {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Double-check user exists in DB to get latest plan/role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, role: true, plan: true, stripeCustomerId: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  return {
    userId: user.id,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
      stripeCustomerId: user.stripeCustomerId,
    },
  };
}

/**
 * Helper to check if the current user is a SUPER_ADMIN.
 * If so, they can bypass tenant scoping (optional feature).
 */
export function isSuperAdmin(context: TenantContext): boolean {
  return context.user.role === 'SUPER_ADMIN';
}
