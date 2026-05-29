import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenant, TenantContext } from '@/lib/tenant';
import { z } from 'zod';
import { LeadStatus } from '@prisma/client';

const updateLeadSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  assignedTo: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId, user } = tenant as TenantContext;

  const { id } = await params;

  try {
    const where = user.role === 'SUPER_ADMIN' ? { id } : { id, userId };
    const lead = await prisma.lead.findFirst({ where });

    if (!lead) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('[LEAD_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId, user } = tenant as TenantContext;

  const { id } = await params;

  try {
    const body = await req.json();
    const result = updateLeadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: result.error.format() },
        { status: 400 }
      );
    }

    if (user.role !== 'SUPER_ADMIN') {
      const existing = await prisma.lead.findFirst({ where: { id, userId } });
      if (!existing) {
        return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
      }
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error('[LEAD_PATCH]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId, user } = tenant as TenantContext;

  const { id } = await params;

  try {
    const where = user.role === 'SUPER_ADMIN' ? { id } : { id, userId };
    const { count } = await prisma.lead.deleteMany({ where });

    if (count === 0) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[LEAD_DELETE]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
