import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { ArrowLeft, ArrowRight, Zap, Settings, MessageCircle, Monitor, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionTitle } from '@/components/shared/SectionTitle';

interface ServicesSectionProps {
  locale: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Zap, Settings, MessageCircle, Monitor, CreditCard,
};

export async function ServicesSection({ locale }: ServicesSectionProps) {
  const t = await getTranslations('services');
  const isRTL = locale === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  let services: any[] = [];
  try {
    services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: 4,
    });
  } catch {
    // DB not connected
  }

  const colors = [
    'var(--solar-gold)',
    'var(--sky-blue)',
    'var(--eco-green)',
    'var(--solar-gold-dark)',
    '#8B5CF6',
  ];

  return (
    <section
      className="section-padding"
      style={{ backgroundColor: 'var(--bg-card)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title={t('title')} subtitle={t('subtitle')} />

        {services.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, titleAr: 'تركيب الأنظمة', titleEn: 'System Installation', descAr: 'تركيب احترافي بأعلى المعايير', descEn: 'Professional installation to highest standards' },
              { icon: Settings, titleAr: 'الصيانة الدورية', titleEn: 'Periodic Maintenance', descAr: 'صيانة لضمان أعلى كفاءة', descEn: 'Maintenance for maximum efficiency' },
              { icon: MessageCircle, titleAr: 'الاستشارة الفنية', titleEn: 'Technical Consultation', descAr: 'استشارات متخصصة مجانية', descEn: 'Free specialized consultations' },
              { icon: Monitor, titleAr: 'المراقبة الذكية', titleEn: 'Smart Monitoring', descAr: 'مراقبة فورية عبر التطبيق', descEn: 'Real-time monitoring via app' },
            ].map((s, i) => {
              const Icon = s.icon;
              const color = colors[i];
              return (
                <div
                  key={i}
                  className="rounded-2xl p-6 card-hover"
                  style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon className="h-7 w-7" style={{ color }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {locale === 'ar' ? s.titleAr : s.titleEn}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {locale === 'ar' ? s.descAr : s.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => {
              const Icon = iconMap[service.icon] || Zap;
              const color = colors[i % colors.length];
              const title = locale === 'ar' ? service.titleAr : service.titleEn;
              const desc = locale === 'ar' ? service.shortDescAr : service.shortDescEn;

              return (
                <div
                  key={service.id}
                  className="rounded-2xl p-6 card-hover group"
                  style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon className="h-7 w-7" style={{ color }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {title}
                  </h3>
                  <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {desc}
                  </p>
                  <Link
                    href={`/${locale}/services/${service.slug}`}
                    className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                    style={{ color }}
                  >
                    {t('learnMore')}
                    <ArrowIcon className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg" className="font-semibold">
            <Link href={`/${locale}/services`}>
              {t('viewAll')}
              <ArrowIcon className="h-4 w-4 ms-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
