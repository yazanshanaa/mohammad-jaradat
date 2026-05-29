import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenant, TenantContext } from '@/lib/tenant';

export async function GET() {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId, user } = tenant as TenantContext;

  try {
    const where = user.role === 'SUPER_ADMIN' ? {} : { userId };
    const media = await prisma.media.findMany({ 
      where,
      orderBy: { createdAt: 'desc' } 
    });
    return NextResponse.json(media);
  } catch (error) {
    console.error('[MEDIA_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
