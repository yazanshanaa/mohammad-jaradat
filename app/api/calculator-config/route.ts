import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenant, TenantContext } from '@/lib/tenant';

export async function GET() {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  try {
    const config = await prisma.calculatorConfig.findUnique({
      where: { userId }
    });
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
    const updateData: any = { ...body };
    delete updateData.id;
    delete updateData.userId;
    delete updateData.updatedAt;
    if (body.systemPricing !== undefined) updateData.systemPricing = body.systemPricing;
    if (body.batteryOptions !== undefined) updateData.batteryOptions = body.batteryOptions;
    if (body.batteryVisible !== undefined) updateData.batteryVisible = body.batteryVisible;

    const config = await prisma.calculatorConfig.upsert({
      where: { userId },
      update: updateData,
      create: { ...updateData, userId }
    });
    return NextResponse.json(config);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
