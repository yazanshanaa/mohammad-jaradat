import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Check, Zap, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'الأنظمة الشمسية' : 'Solar Systems',
    description: locale === 'ar' ? 'تشكيلة متكاملة من أنظمة الطاقة الشمسية' : 'Complete range of solar energy systems',
  };
}

const typeColors: Record<string, string> = {
  ON_GRID: 'var(--sky-blue)',
  OFF_GRID: 'var(--eco-green)',
  HYBRID: 'var(--solar-gold)',
  AGRICULTURAL: '#8B5CF6',
  COMMERCIAL: 'var(--navy-light)',
};

export default async function SystemsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('systems');
  const isRTL = locale === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const typeLabels: Record<string, string> = {
    ON_GRID: t('onGrid'), OFF_GRID: t('offGrid'), HYBRID: t('hybrid'),
    AGRICULTURAL: t('agricultural'), COMMERCIAL: t('commercial'),
  };

  let systems: any[] = [];
  try {
    systems = await prisma.solarSystem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  } catch { /* DB not connected */ }

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Hero */}
      <section
        className="py-20 text-center text-white"
        style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)' }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ backgroundColor: 'rgba(245,166,35,0.2)', color: 'var(--solar-gold)', border: '1px solid rgba(245,166,35,0.3)' }}>
            <Zap className="h-4 w-4" />
            {locale === 'ar' ? 'أنظمتنا الشمسية' : 'Our Solar Systems'}
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">{t('title')}</h1>
          <p className="text-lg opacity-80">{t('subtitle')}</p>
        </div>
      </section>

      {/* Systems Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {systems.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
            <Zap className="h-16 w-16 mx-auto mb-4 opacity-30" style={{ color: 'var(--solar-gold)' }} />
            <p>{locale === 'ar' ? 'لا توجد أنظمة حالياً — أضف قاعدة البيانات' : 'No systems yet — connect the database'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {systems.map((system) => {
              const color = typeColors[system.type] || 'var(--solar-gold)';
              const title = locale === 'ar' ? system.titleAr : system.titleEn;
              const desc = locale === 'ar' ? system.descriptionAr : system.descriptionEn;
              const features = Array.isArray(system.features) ? system.features : [];

              return (
                <div key={system.id} className="rounded-2xl overflow-hidden card-hover flex flex-col"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  {/* Header */}
                  <div className="h-44 relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}>
                    <ImageWithFallback
                      src={system.coverImage}
                      alt={title}
                      className="absolute inset-0 w-full h-full object-cover"
                      fallback={
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-24 h-24 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: `${color}33` }}>
                            <Zap className="h-12 w-12" style={{ color }} />
                          </div>
                        </div>
                      }
                    />
                    <div className="absolute top-4 start-4">
                      <Badge className="text-white text-xs font-semibold" style={{ backgroundColor: color }}>
                        {typeLabels[system.type]}
                      </Badge>
                    </div>
                    {system.isFeatured && (
                      <div className="absolute top-4 end-4">
                        <Badge variant="secondary" className="text-xs">
                          {locale === 'ar' ? '⭐ مميز' : '⭐ Featured'}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h2>
                    <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: 'var(--text-secondary)' }}>{desc}</p>

                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="rounded-xl p-3 text-center" style={{ backgroundColor: `${color}15` }}>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{t('minPower')}</p>
                        <p className="font-bold" style={{ color }}>{(system.minPower / 1000).toFixed(1)} kW</p>
                      </div>
                      <div className="rounded-xl p-3 text-center" style={{ backgroundColor: `${color}15` }}>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{t('maxPower')}</p>
                        <p className="font-bold" style={{ color }}>{(system.maxPower / 1000).toFixed(0)} kW</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between p-3 rounded-xl mb-5"
                      style={{ backgroundColor: `${color}10`, border: `1px solid ${color}30` }}>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t('from')}</span>
                      <span className="text-xl font-black" style={{ color }}>₪{system.pricePerWatt}/{locale === 'ar' ? 'واط' : 'W'}</span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {features.slice(0, 4).map((f: any, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <Check className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--eco-green)' }} />
                          {locale === 'ar' ? f.ar : f.en}
                        </li>
                      ))}
                    </ul>

                    <div className="flex gap-3">
                      <Button asChild className="flex-1 text-white font-semibold" style={{ backgroundColor: color }}>
                        <Link href={`/${locale}/systems/${system.slug}`}>
                          {t('viewDetails')}
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="flex-1 font-semibold">
                        <Link href={`/${locale}/contact`}>
                          {locale === 'ar' ? 'طلب عرض' : 'Get Quote'}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="py-16 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {locale === 'ar' ? 'لا تعرف أي نظام مناسب لك؟' : "Not sure which system suits you?"}
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            {locale === 'ar' ? 'جرّب حاسبتنا الذكية وستحصل على توصية دقيقة خلال دقيقتين' : "Try our smart calculator and get an accurate recommendation in 2 minutes"}
          </p>
          <Button asChild size="lg" className="font-bold text-white" style={{ backgroundColor: 'var(--solar-gold)' }}>
            <Link href={`/${locale}/calculator`}>
              {locale === 'ar' ? 'احسب نظامك الآن' : 'Calculate Your System'}
              <ArrowIcon className="h-4 w-4 ms-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
