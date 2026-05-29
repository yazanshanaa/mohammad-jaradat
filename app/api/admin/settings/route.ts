import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenant, TenantContext } from '@/lib/tenant';

export async function GET() {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  try {
    const settings = await prisma.setting.findMany({
      where: { userId },
      orderBy: { group: 'asc' }
    });
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json([]);
  }
}

export async function PUT(req: NextRequest) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  const settings: { key: string; value: string }[] = await req.json();

  try {
    await Promise.all(
      settings.map(s =>
        prisma.setting.upsert({
          where: {
            key_userId: {
              key: s.key,
              userId: userId
            }
          },
          update: { value: s.value },
          create: {
            key: s.key,
            value: s.value,
            type: 'text',
            group: 'general',
            userId: userId
          },
        })
      )
    );
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

