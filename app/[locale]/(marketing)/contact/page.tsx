import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import { ContactForm } from '@/components/forms/ContactForm';
import { getSettings } from '@/lib/settings';

type Props = { params: Promise<{ locale: string }> };

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.02a8.16 8.16 0 004.77 1.52V7.09a4.85 4.85 0 01-1-.4z" />
    </svg>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === 'ar' ? 'اتصل بنا' : 'Contact Us' };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('contact');
  const settings = await getSettings();

  const phone = settings.phone || '+970591234567';
  const whatsapp = settings.whatsapp || '970591234567';
  const addressAr = settings.address_ar || 'فلسطين';
  const addressEn = settings.address_en || 'Palestine';
  const hoursAr = settings.working_hours_ar || 'الأحد - الخميس: 8:00 - 17:00';
  const hoursEn = settings.working_hours_en || 'Sun - Thu: 8:00 AM - 5:00 PM';
  const locationUrl = settings.location_url || '';

  const contactInfo = [
    {
      icon: Phone,
      labelAr: 'الهاتف', labelEn: 'Phone',
      valueAr: phone, valueEn: phone,
      href: `tel:${phone}`, color: 'var(--solar-gold)',
    },
    {
      icon: MessageCircle,
      labelAr: 'واتساب', labelEn: 'WhatsApp',
      valueAr: phone, valueEn: phone,
      href: `https://wa.me/${whatsapp}`, color: '#25D366',
    },
    {
      icon: MapPin,
      labelAr: 'العنوان', labelEn: 'Address',
      valueAr: addressAr, valueEn: addressEn,
      href: locationUrl || undefined, color: 'var(--eco-green)',
    },
    {
      icon: Clock,
      labelAr: 'ساعات العمل', labelEn: 'Working Hours',
      valueAr: hoursAr, valueEn: hoursEn,
      href: undefined, color: 'var(--solar-gold-dark)',
    },
  ];

  const socialLinks = [
    { Icon: FacebookIcon, href: settings.facebook, label: 'Facebook', color: '#1877F2' },
    { Icon: InstagramIcon, href: settings.instagram, label: 'Instagram', color: '#E1306C' },
    { Icon: TikTokIcon, href: settings.tiktok, label: 'TikTok', color: '#000000' },
  ].filter(s => s.href);

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="py-20 text-white text-center"
        style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)' }}>
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-black mb-4">{t('title')}</h1>
          <p className="text-lg opacity-80">{t('subtitle')}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              {locale === 'ar' ? 'معلومات التواصل' : 'Contact Information'}
            </h2>
            {contactInfo.map(({ icon: Icon, labelAr, labelEn, valueAr, valueEn, href, color }) => (
              <div key={labelEn}
                className="flex items-start gap-4 p-5 rounded-2xl card-hover"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}20` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {locale === 'ar' ? labelAr : labelEn}
                  </p>
                  {href ? (
                    <a href={href} target={href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="font-semibold hover:opacity-75 transition-opacity"
                      style={{ color: 'var(--text-primary)' }}>
                      {locale === 'ar' ? valueAr : valueEn}
                    </a>
                  ) : (
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {locale === 'ar' ? valueAr : valueEn}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Social Media */}
            {socialLinks.length > 0 && (
              <div className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {locale === 'ar' ? 'تابعنا على' : 'Follow us on'}
                </p>
                <div className="flex items-center gap-3">
                  {socialLinks.map(({ Icon, href, label, color }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Quick CTA */}
            <div className="p-6 rounded-2xl text-white mt-6"
              style={{ background: 'linear-gradient(135deg, var(--solar-gold), var(--solar-gold-dark))' }}>
              <h3 className="font-bold text-lg mb-2">
                {locale === 'ar' ? 'تواصل فوري عبر واتساب' : 'Instant WhatsApp Chat'}
              </h3>
              <p className="text-sm opacity-90 mb-4">
                {locale === 'ar' ? 'ابدأ محادثة وسنرد خلال دقائق' : "Start a conversation and we'll reply in minutes"}
              </p>
              <a href={`https://wa.me/${whatsapp}?text=مرحباً%20أريد%20الاستفسار`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ color: 'var(--solar-gold)' }}>
                <MessageCircle className="h-4 w-4" />
                {locale === 'ar' ? 'تواصل الآن' : 'Chat Now'}
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'أرسل لنا رسالة' : 'Send Us a Message'}
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-10 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <div className="h-64 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--navy)22, var(--navy-light)44)' }}>
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--solar-gold)' }} />
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {locale === 'ar' ? addressAr : addressEn}
              </p>
              {locationUrl && (
                <a href={locationUrl}
                  target="_blank" rel="noopener noreferrer"
                  className="text-sm mt-2 inline-block"
                  style={{ color: 'var(--solar-gold)' }}>
                  {locale === 'ar' ? 'فتح في خرائط جوجل ←' : 'Open in Google Maps →'}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
