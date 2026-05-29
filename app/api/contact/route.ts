import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validations';
import { sendContactEmail, sendAutoReply } from '@/lib/email';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const { success, resetAt } = await checkRateLimit(`contact:post:${ip}`, 5, 60000);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'X-RateLimit-Reset': resetAt.toISOString() },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 });
  }

  const { name, phone, email, message } = result.data;

  if (process.env.RESEND_API_KEY) {
    try {
      await sendContactEmail({ name, email, phone, message });
      if (email) {
        await sendAutoReply({ name, email });
      }
    } catch (e) {
      console.error('Email send failed:', e);
    }
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
