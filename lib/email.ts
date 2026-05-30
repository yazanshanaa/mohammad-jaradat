import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder');
  }
  return _resend;
}

const FROM = process.env.RESEND_FROM_EMAIL || 'no-reply@solarpro.ps';
const TO = process.env.CONTACT_EMAIL || 'info@solarpro.ps';

interface ContactEmailParams {
  name: string;
  email?: string;
  phone: string;
  message: string;
  subject?: string;
}

export async function sendContactEmail({
  name,
  email,
  phone,
  message,
  subject,
}: ContactEmailParams): Promise<void> {
  await getResend().emails.send({
    from: FROM,
    to: TO,
    subject: subject ?? `رسالة جديدة من ${name}`,
    html: `
      <div dir="rtl" style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0A2540">رسالة جديدة من موقع SolarPro</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;font-weight:bold;color:#555">الاسم:</td><td style="padding:8px">${name}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#555">الهاتف:</td><td style="padding:8px">${phone}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#555">البريد الإلكتروني:</td><td style="padding:8px">${email || 'غير محدد'}</td></tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:8px">
          <p style="font-weight:bold;color:#555;margin:0 0 8px">الرسالة:</p>
          <p style="margin:0;white-space:pre-line">${message}</p>
        </div>
      </div>
    `,
  });
}

interface AutoReplyParams {
  name: string;
  email: string;
}

export async function sendAutoReply({ name, email }: AutoReplyParams): Promise<void> {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: 'شكراً لتواصلك مع SolarPro',
    html: `
      <div dir="rtl" style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0A2540">شكراً لتواصلك معنا</h2>
        <p>عزيزي ${name}،</p>
        <p>تلقينا رسالتك وسنتواصل معك في أقرب وقت ممكن.</p>
        <p style="color:#F5A623;font-weight:bold">فريق SolarPro</p>
      </div>
    `,
  });
}
