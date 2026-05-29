import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { ArrowLeft, MapPin, Zap, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SectionTitle } from '@/components/shared/SectionTitle';

interface ProjectsGridProps {
  locale: string;
}

export async function ProjectsGrid({ locale }: ProjectsGridProps) {
  const t = await getTranslations('projects');

  // فحص إعداد الإظهار/الإخفاء
  try {
    const visSetting = await prisma.setting.findFirst({
      where: { key: 'section_projects_visible', user: { role: 'SUPER_ADMIN' } },
    });
    if (visSetting && visSetting.value === 'false') return null;
  } catch { /* إظهار افتراضي */ }

  let projects: any[] = [];
  try {
    projects = await prisma.project.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { completionDate: 'desc' },
      take: 3,
    });
  } catch {
    // DB not connected
  }

  const categoryLabels: Record<string, string> = {
    RESIDENTIAL: t('residential'),
    COMMERCIAL: t('commercial'),
    INDUSTRIAL: t('industrial'),
    AGRICULTURAL: t('agricultural'),
  };

  const categoryColors: Record<string, string> = {
    RESIDENTIAL: 'var(--sky-blue)',
    COMMERCIAL: 'var(--solar-gold)',
    INDUSTRIAL: '#8B5CF6',
    AGRICULTURAL: 'var(--eco-green)',
  };

  return (
    <section className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title={t('title')} subtitle={t('subtitle')} />

        {projects.length === 0 ? (
          <div
            className="text-center py-12 rounded-2xl"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <Building className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--solar-gold)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>
              سيتم عرض المشاريع بعد توصيل قاعدة البيانات
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {projects.map((project) => {
              const color = categoryColors[project.category] || 'var(--solar-gold)';

              return (
                <Link
                  key={project.id}
                  href={`/${locale}/projects/${project.slug}`}
                  className="group rounded-2xl overflow-hidden card-hover block"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  {/* صورة */}
                  <div
                    className="h-48 flex items-center justify-center relative"
                    style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}
                  >
                    <Zap className="h-16 w-16 opacity-40" style={{ color }} />
                    <div className="absolute top-4 start-4">
                      <Badge className="text-white text-xs" style={{ backgroundColor: color }}>
                        {categoryLabels[project.category]}
                      </Badge>
                    </div>
                    {project.isFeatured && (
                      <div className="absolute top-4 end-4">
                        <Badge variant="secondary" className="text-xs">مميز</Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3
                      className="font-bold text-lg mb-3 group-hover:text-solar-gold transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {project.titleAr || project.titleEn}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className="flex items-center gap-2 p-2 rounded-lg text-sm"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        <Zap className="h-4 w-4" style={{ color }} />
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {project.powerKw} {t('kw')}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-2 p-2 rounded-lg text-sm"
                        style={{ backgroundColor: 'rgba(0, 184, 148, 0.1)' }}
                      >
                        <span style={{ color: 'var(--eco-green)', fontWeight: 700 }}>₪</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {project.annualSavingIls.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <MapPin className="h-3.5 w-3.5" />
                      {project.location}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="text-center">
          <Button asChild variant="outline" size="lg" className="font-semibold">
            <Link href={`/${locale}/projects`}>
              {t('viewAll')}
              <ArrowLeft className="h-4 w-4 ms-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
