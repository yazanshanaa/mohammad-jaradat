import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/authHelpers';

export async function GET() {
  const session = await auth();
  const authError = requireAdmin(session);
  if (authError) return authError;

  try {
    const [
      totalLeads,
      newLeads,
      wonLeads,
      totalProjects,
      totalSystems,
      totalSubscribers,
      recentLeads,
      leadsByStatus,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'NEW' } }),
      prisma.lead.count({ where: { status: 'WON' } }),
      prisma.project.count({ where: { isActive: true } }),
      prisma.solarSystem.count({ where: { isActive: true } }),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
      prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, phone: true, location: true, usageType: true, status: true, createdAt: true, monthlyBillIls: true },
      }),
      prisma.lead.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    return NextResponse.json({
      totalLeads,
      newLeads,
      wonLeads,
      totalProjects,
      totalSystems,
      totalSubscribers,
      recentLeads,
      leadsByStatus,
    });
  } catch {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}
