import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { getTenant, TenantContext } from '@/lib/tenant';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 422 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size must not exceed 5 MB' }, { status: 422 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadImage(buffer, `solarpro/${userId}`); // Organize by tenant

    await prisma.media.create({
      data: {
        filename: file.name,
        url: result.url,
        publicId: result.publicId,
        size: file.size,
        format: result.format,
        width: result.width,
        height: result.height,
        folder: `solarpro/${userId}`,
        userId: userId,
      },
    });

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error('[UPLOAD_ERROR]', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
