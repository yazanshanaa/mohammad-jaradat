import { NextRequest, NextResponse } from 'next/server';
import { newsletterSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const result = newsletterSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 });
  }

  try {
    const email = result.data.email;
    const existing = await prisma.newsletterSubscriber.findFirst({
      where: { email },
    });

    if (existing) {
      if (!existing.isActive) {
        await prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
      }
    } else {
      // For public newsletter subscriptions without a logged-in user,
      // use a system/placeholder userId or skip if schema requires it.
      // Since userId is required, we store the email with the first admin user.
      const adminUser = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' },
        select: { id: true },
      });
      if (adminUser) {
        await prisma.newsletterSubscriber.create({
          data: { email, userId: adminUser.id },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
