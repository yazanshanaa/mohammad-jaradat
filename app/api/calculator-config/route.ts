import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenant, TenantContext } from '@/lib/tenant';

export async function GET() {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  try {
    const config = await prisma.calculatorConfig.findUnique({ where: { userId } });
    return NextResponse.json(config || {});
  } catch {
    return NextResponse.json({});
  }
}

export async function PUT(req: NextRequest) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  const body = await req.json();

  try {
    const updateData: Record<string, unknown> = { ...body };
    delete updateData.id;
    delete updateData.userId;
    delete updateData.updatedAt;

    const config = await prisma.calculatorConfig.upsert({
      where: { userId },
      update: updateData,
      create: { ...updateData, userId },
    });
    return NextResponse.json(config);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
