import { NextRequest, NextResponse } from 'next/server';
import { leadSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { getTenant, TenantContext } from '@/lib/tenant';
import type { Prisma } from '@prisma/client';

/**
 * POST: Create new lead (Authenticated Tenant CRM)
 * For public leads, we'd need a separate public API that accepts a tenant ID.
 */
export async function POST(req: NextRequest) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const result = leadSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 });
  }

  try {
    const lead = await prisma.lead.create({
      data: {
        ...result.data,
        email: result.data.email || undefined,
        source: 'manual_entry',
        userId: userId, // Scoped to tenant
      },
    });

    return NextResponse.json({ success: true, id: lead.id });
  } catch (error) {
    console.error('Lead creation failed:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

/**
 * GET: Fetch leads for the authenticated tenant ONLY
 */
export async function GET(req: NextRequest) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');

    // Strict Tenant Scoping
    const where: Prisma.LeadWhereInput = {
      userId: userId, 
    };

    if (status && status !== 'ALL') where.status = status as Prisma.EnumLeadStatusFilter;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({ leads, total });
  } catch (error) {
    console.error('Leads fetch failed:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
