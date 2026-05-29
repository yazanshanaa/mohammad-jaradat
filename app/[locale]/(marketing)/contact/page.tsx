import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { ContactForm } from '@/components/forms/ContactForm';
import { getSettings } from '@/lib/settings';

type Props = { params: Promise<{ locale: string }> };

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
  const email = settings.email || 'info@solarpro.ps';
  const addressAr = settings.address_ar || 'رام الله، فلسطين';
  const addressEn = settings.address_en || 'Ramallah, Palestine';
  const hoursAr = settings.working_hours_ar || 'الأحد - الخميس: 8:00 - 17:00';
  const hoursEn = settings.working_hours_en || 'Sun - Thu: 8:00 AM - 5:00 PM';

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
      icon: Mail,
      labelAr: 'البريد الإلكتروني', labelEn: 'Email',
      valueAr: email, valueEn: email,
      href: `mailto:${email}`, color: 'var(--sky-blue)',
    },
    {
      icon: MapPin,
      labelAr: 'العنوان', labelEn: 'Address',
      valueAr: addressAr, valueEn: addressEn,
      href: undefined, color: 'var(--eco-green)',
    },
    {
      icon: Clock,
      labelAr: 'ساعات العمل', labelEn: 'Working Hours',
      valueAr: hoursAr, valueEn: hoursEn,
      href: undefined, color: 'var(--solar-gold-dark)',
    },
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

        {/* Map placeholder */}
        <div className="mt-10 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <div className="h-64 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--navy)22, var(--navy-light)44)' }}>
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--solar-gold)' }} />
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {locale === 'ar' ? addressAr : addressEn}
              </p>
              <a href="https://maps.google.com/?q=Ramallah+Palestine"
                target="_blank" rel="noopener noreferrer"
                className="text-sm mt-2 inline-block"
                style={{ color: 'var(--solar-gold)' }}>
                {locale === 'ar' ? 'فتح في خرائط جوجل ←' : 'Open in Google Maps →'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
