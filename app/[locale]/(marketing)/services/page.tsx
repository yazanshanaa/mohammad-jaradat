import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Zap, Settings, MessageCircle, Monitor, CreditCard, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionTitle } from '@/components/shared/SectionTitle';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === 'ar' ? 'خدماتنا' : 'Our Services' };
}

const iconMap: Record<string, any> = { Zap, Settings, MessageCircle, Monitor, CreditCard };
const colors = ['var(--solar-gold)', 'var(--sky-blue)', 'var(--eco-green)', 'var(--solar-gold-dark)', '#8B5CF6'];

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  const isRTL = locale === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  let services: any[] = [];
  try {
    services = await prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  } catch { /* DB not connected */ }

  const whyUs = [
    { icon: '🏆', titleAr: 'خبرة 10 سنوات', titleEn: '10 Years Experience', descAr: 'أكثر من عقد في مجال الطاقة الشمسية', descEn: 'Over a decade in solar energy' },
    { icon: '🛡️', titleAr: 'ضمان شامل', titleEn: 'Full Warranty', descAr: '15 سنة على الألواح، 5 سنوات على التركيب', descEn: '15yr panels, 5yr installation' },
    { icon: '⚡', titleAr: 'تركيب سريع', titleEn: 'Fast Installation', descAr: 'إنجاز المشروع خلال 1-3 أيام', descEn: 'Project completion in 1-3 days' },
    { icon: '📞', titleAr: 'دعم مستمر', titleEn: 'Ongoing Support', descAr: 'فريق دعم متاح على مدار الساعة', descEn: '24/7 support team available' },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="py-20 text-white text-center"
        style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)' }}>
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            {locale === 'ar' ? 'خدماتنا' : 'Our Services'}
          </h1>
          <p className="text-lg opacity-80">
            {locale === 'ar' ? 'كل ما تحتاجه في مجال الطاقة الشمسية تحت سقف واحد' : 'Everything you need in solar energy under one roof'}
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {services.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: 'Zap', titleAr: 'تركيب الأنظمة الشمسية', titleEn: 'Solar System Installation', slug: 'installation' },
              { icon: 'Settings', titleAr: 'الصيانة الدورية', titleEn: 'Periodic Maintenance', slug: 'maintenance' },
              { icon: 'MessageCircle', titleAr: 'الاستشارة الفنية', titleEn: 'Technical Consultation', slug: 'consultation' },
              { icon: 'Monitor', titleAr: 'المراقبة الذكية', titleEn: 'Smart Monitoring', slug: 'monitoring' },
            ].map((s, i) => {
              const Icon = iconMap[s.icon] || Zap;
              const color = colors[i];
              return (
                <div key={s.slug} className="rounded-2xl p-8 card-hover"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${color}20` }}>
                    <Icon className="h-8 w-8" style={{ color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    {locale === 'ar' ? s.titleAr : s.titleEn}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {locale === 'ar' ? 'خدمة احترافية بأعلى معايير الجودة' : 'Professional service with highest quality standards'}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, i) => {
              const Icon = iconMap[service.icon] || Zap;
              const color = colors[i % colors.length];
              const title = locale === 'ar' ? service.titleAr : service.titleEn;
              const desc = locale === 'ar' ? service.descriptionAr : service.descriptionEn;
              const features = Array.isArray(service.features) ? service.features : [];

              return (
                <div key={service.id} className="rounded-2xl overflow-hidden card-hover flex flex-col"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="p-8 flex-1">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${color}20` }}>
                        <Icon className="h-8 w-8" style={{ color }} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                    <ul className="space-y-3">
                      {features.slice(0, 3).map((f: any, j: number) => (
                        <li key={j} className="flex items-center gap-3 text-sm">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${color}20` }}>
                            <Check className="h-3 w-3" style={{ color }} />
                          </div>
                          <span style={{ color: 'var(--text-secondary)' }}>{locale === 'ar' ? f.ar : f.en}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="px-8 pb-8">
                    <Button asChild className="w-full font-semibold text-white" style={{ backgroundColor: color }}>
                      <Link href={`/${locale}/contact`}>
                        {locale === 'ar' ? 'احصل على عرض' : 'Get a Quote'}
                        <ArrowIcon className="h-4 w-4 ms-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Why Us */}
      <section className="py-16" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title={locale === 'ar' ? 'لماذا تختار سولار برو؟' : 'Why Choose SolarPro?'}
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUs.map((item, i) => (
              <div key={i} className="text-center p-6 rounded-2xl card-hover"
                style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h4 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'ar' ? item.titleAr : item.titleEn}
                </h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {locale === 'ar' ? item.descAr : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
