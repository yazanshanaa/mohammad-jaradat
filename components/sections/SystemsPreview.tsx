import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { ArrowLeft, ArrowRight, Zap, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { Badge } from '@/components/ui/badge';

interface SystemsPreviewProps {
  locale: string;
}

const systemTypeColors: Record<string, string> = {
  ON_GRID: 'var(--sky-blue)',
  OFF_GRID: 'var(--eco-green)',
  HYBRID: 'var(--solar-gold)',
  AGRICULTURAL: '#8B5CF6',
  COMMERCIAL: 'var(--navy-light)',
};

export async function SystemsPreview({ locale }: SystemsPreviewProps) {
  const t = await getTranslations('systems');
  const isRTL = locale === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  let systems: any[] = [];
  try {
    systems = await prisma.solarSystem.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { sortOrder: 'asc' },
      take: 3,
    });
  } catch {
    // DB not connected yet — show placeholder
  }

  const typeLabels: Record<string, string> = {
    ON_GRID: t('onGrid'),
    OFF_GRID: t('offGrid'),
    HYBRID: t('hybrid'),
    AGRICULTURAL: t('agricultural'),
    COMMERCIAL: t('commercial'),
  };

  return (
    <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title={t('title')}
          subtitle={t('subtitle')}
        />

        {systems.length === 0 ? (
          <div
            className="text-center py-12 rounded-2xl"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <Zap className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--solar-gold)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>
              {locale === 'ar' ? 'قاعدة البيانات غير متصلة بعد — أضف بيانات في .env.local' : 'Database not connected yet — add credentials in .env.local'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {systems.map((system) => {
              const features = Array.isArray(system.features) ? system.features : [];
              const color = systemTypeColors[system.type] || 'var(--solar-gold)';
              const title = locale === 'ar' ? system.titleAr : system.titleEn;
              const desc = locale === 'ar' ? system.descriptionAr : system.descriptionEn;

              return (
                <div
                  key={system.id}
                  className="rounded-2xl overflow-hidden card-hover"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  {/* Header */}
                  <div
                    className="h-40 flex items-center justify-center relative"
                    style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}
                  >
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${color}33`, backdropFilter: 'blur(10px)' }}
                    >
                      <Zap className="h-10 w-10" style={{ color }} />
                    </div>
                    <div className="absolute top-4 start-4">
                      <Badge
                        className="text-white text-xs font-medium"
                        style={{ backgroundColor: color }}
                      >
                        {typeLabels[system.type]}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed mb-4 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                      {desc}
                    </p>

                    {/* Price */}
                    <div
                      className="flex items-center justify-between p-3 rounded-xl mb-4"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {t('from')}
                      </span>
                      <span className="font-black text-lg" style={{ color }}>
                        ₪{system.pricePerWatt} / {t('perWatt').replace('₪/', '')}
                      </span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-5">
                      {features.slice(0, 3).map((f: { ar: string; en: string }, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <Check className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--eco-green)' }} />
                          {locale === 'ar' ? f.ar : f.en}
                        </li>
                      ))}
                    </ul>

                    <Button asChild className="w-full text-white font-semibold" style={{ backgroundColor: color }}>
                      <Link href={`/${locale}/systems/${system.slug}`}>
                        {t('viewDetails')}
                        <ArrowIcon className="h-4 w-4 ms-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center">
          <Button asChild variant="outline" size="lg" className="font-semibold">
            <Link href={`/${locale}/systems`}>
              {t('viewAll')}
              <ArrowIcon className="h-4 w-4 ms-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
