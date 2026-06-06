import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const adminConfig = await prisma.calculatorConfig.findFirst({
      where: { user: { role: 'SUPER_ADMIN' } },
    });

    if (!adminConfig) {
      return NextResponse.json({
        pricePerKwhIls: 0.70,
        sunHoursPerDay: 5.5,
        panelWatts: 620,
        minBillIls: 300,
        maxBillIls: 3000,
        maxSystemKw: 30,
        systemSizes: [],
        batteryOptions: [],
        batteryVisible: true,
        contactWhatsapp: '',
        contactPhone: '',
        contactEmail: '',
        contactMessage: 'نظامك يحتاج دراسة خاصة، تواصل معنا مباشرة وسيقوم فريقنا بمساعدتك',
        systemContent: null,
      });
    }

    return NextResponse.json({
      pricePerKwhIls: adminConfig.pricePerKwhIls,
      sunHoursPerDay: adminConfig.sunHoursPerDay,
      panelWatts: adminConfig.panelWatts,
      minBillIls: adminConfig.minBillIls,
      maxBillIls: adminConfig.maxBillIls,
      maxSystemKw: adminConfig.maxSystemKw,
      systemSizes: adminConfig.systemSizes ?? [],
      batteryOptions: adminConfig.batteryOptions ?? [],
      batteryVisible: adminConfig.batteryVisible,
      contactWhatsapp: adminConfig.contactWhatsapp,
      contactPhone: adminConfig.contactPhone,
      contactEmail: adminConfig.contactEmail,
      contactMessage: adminConfig.contactMessage,
      systemContent: adminConfig.systemContent ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load calculator config' },
      { status: 500 },
    );
  }
}
