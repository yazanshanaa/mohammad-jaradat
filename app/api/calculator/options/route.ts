import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// نقطة وصول عامة لإرجاع خيارات البطاريات للحاسبة العامة
export async function GET() {
  try {
    const adminConfig = await prisma.calculatorConfig.findFirst({
      where: { user: { role: 'SUPER_ADMIN' } },
      select: { batteryOptions: true, batteryVisible: true },
    });

    return NextResponse.json({
      batteryOptions: (adminConfig?.batteryOptions as any[]) ?? [],
      batteryVisible: adminConfig?.batteryVisible ?? true,
    });
  } catch {
    return NextResponse.json({ batteryOptions: [], batteryVisible: true });
  }
}
