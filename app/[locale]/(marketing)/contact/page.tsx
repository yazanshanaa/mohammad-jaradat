import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import { WhatsAppContactForm } from '@/components/forms/WhatsAppContactForm';
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

  // منصات التواصل — تظهر دائماً، لكن تُفعَّل فقط عند وجود رابط
  const socialPlatforms = [
    { Icon: FacebookIcon, href: settings.facebook || '', label: 'Facebook', color: '#1877F2' },
    { Icon: InstagramIcon, href: settings.instagram || '', label: 'Instagram', color: '#E1306C' },
    { Icon: TikTokIcon, href: settings.tiktok || '', label: 'TikTok', color: '#010101' },
  ];

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

          {/* Contact Info — العمود الأيمن */}
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

            {/* Social Media — تظهر الأيقونات الثلاث دائماً */}
            <div className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
                {locale === 'ar' ? 'تابعنا على' : 'Follow us on'}
              </p>
              <div className="flex items-center gap-3">
                {socialPlatforms.map(({ Icon, href, label, color }) => {
                  const hasUrl = Boolean(href);
                  const content = (
                    <span
                      key={label}
                      aria-label={label}
                      className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
                      style={{
                        backgroundColor: hasUrl ? `${color}15` : 'var(--bg-primary)',
                        color: hasUrl ? color : 'var(--text-secondary)',
                        opacity: hasUrl ? 1 : 0.4,
                        cursor: hasUrl ? 'pointer' : 'default',
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  );
                  return hasUrl ? (
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
                  ) : content;
                })}
              </div>
            </div>
          </div>

          {/* نموذج واتساب — العمود الأيسر */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {/* عنوان مع أيقونة واتساب */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {locale === 'ar' ? 'راسلنا عبر واتساب' : 'Message Us on WhatsApp'}
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {locale === 'ar' ? 'سنرد عليك في أقرب وقت ممكن' : "We'll reply as soon as possible"}
                  </p>
                </div>
              </div>

              <WhatsAppContactForm whatsapp={whatsapp} locale={locale} />
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
                  className="text-sm mt-2 inline-block hover:opacity-75 transition-opacity"
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
