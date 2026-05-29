import { NextRequest, NextResponse } from 'next/server';
import { calculateSolarSystem, type CalculatorInput, type CalculatorConfigData } from '@/lib/calculator';
import { prisma } from '@/lib/prisma';
import { getTenant, TenantContext } from '@/lib/tenant';

export async function POST(req: NextRequest) {
  let userId: string | undefined;

  try {
    const tenant = await getTenant();
    if (!(tenant instanceof NextResponse)) {
      userId = (tenant as TenantContext).userId;
    }
  } catch {
    // public user
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  let config: CalculatorConfigData = {
    averageSunHoursPerDay: 5.5,
    panelWatts: 550,
    inverterEfficiency: 0.96,
    systemLoss: 0.14,
    pricePerKwhIls: 0.70,
    pricePerWattInstalled: 4.50,
    panelPriceIls: 400,
    inverterPriceBase: 3500,
    batteryPricePerKwh: 2200,
    systemLifeYears: 25,
    annualDegradation: 0.005,
    co2PerKwh: 0.49,
  };

  try {
    const dbConfig = userId
      ? await prisma.calculatorConfig.findUnique({ where: { userId } })
      : await prisma.calculatorConfig.findFirst({ where: { user: { role: 'SUPER_ADMIN' } } });

    if (dbConfig) {
      config = {
        ...config,
        averageSunHoursPerDay: dbConfig.averageSunHoursPerDay ?? config.averageSunHoursPerDay,
        panelWatts: dbConfig.panelWatts ?? config.panelWatts,
        inverterEfficiency: dbConfig.inverterEfficiency ?? config.inverterEfficiency,
        systemLoss: dbConfig.systemLoss ?? config.systemLoss,
        pricePerKwhIls: dbConfig.pricePerKwhIls ?? config.pricePerKwhIls,
        pricePerWattInstalled: dbConfig.pricePerWattInstalled ?? config.pricePerWattInstalled,
        panelPriceIls: dbConfig.panelPriceIls ?? config.panelPriceIls,
        inverterPriceBase: dbConfig.inverterPriceBase ?? config.inverterPriceBase,
        batteryPricePerKwh: dbConfig.batteryPricePerKwh ?? config.batteryPricePerKwh,
        systemLifeYears: dbConfig.systemLifeYears ?? config.systemLifeYears,
        annualDegradation: dbConfig.annualDegradation ?? config.annualDegradation,
        co2PerKwh: dbConfig.co2PerKwh ?? config.co2PerKwh,
        systemPricing: dbConfig.systemPricing as Record<string, number> | undefined,
        batteryOptions: dbConfig.batteryOptions as any[] | undefined,
        batteryVisible: (dbConfig as any).batteryVisible ?? true,
      };
    }
  } catch (e) {
    console.error('Failed to load calculator config:', e);
  }

  try {
    const calcInput: CalculatorInput = {
      ...(body as any),
      config,
    };
    const result = calculateSolarSystem(calcInput);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
