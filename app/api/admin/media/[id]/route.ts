import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenant, TenantContext } from '@/lib/tenant';
import { deleteImage } from '@/lib/cloudinary';

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
    const media = await prisma.media.findFirst({ where });
    
    if (!media) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await deleteImage(media.publicId);
    await prisma.media.delete({ where: { id } });
    
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error('[MEDIA_DELETE]', e);
    const message = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
