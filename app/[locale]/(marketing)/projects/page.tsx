import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { MapPin, Zap, Building, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { getLocalized } from '@/lib/utils';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === 'ar' ? 'مشاريعنا' : 'Our Projects' };
}

const categoryColors: Record<string, string> = {
  RESIDENTIAL: 'var(--sky-blue)', COMMERCIAL: 'var(--solar-gold)',
  INDUSTRIAL: '#8B5CF6', AGRICULTURAL: 'var(--eco-green)',
};

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;

  const categoryLabels: Record<string, { ar: string; en: string }> = {
    RESIDENTIAL: { ar: 'سكني', en: 'Residential' },
    COMMERCIAL: { ar: 'تجاري', en: 'Commercial' },
    INDUSTRIAL: { ar: 'صناعي', en: 'Industrial' },
    AGRICULTURAL: { ar: 'زراعي', en: 'Agricultural' },
  };

  let projects: any[] = [];
  try {
    projects = await prisma.project.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { completionDate: 'desc' }],
    });
  } catch { /* DB not connected */ }

  // Stats
  const stats = {
    total: projects.length,
    totalKw: projects.reduce((s: number, p: any) => s + p.powerKw, 0),
    totalSaving: projects.reduce((s: number, p: any) => s + p.annualSavingIls, 0),
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="py-20 text-white text-center"
        style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)' }}>
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            {locale === 'ar' ? 'مشاريعنا' : 'Our Projects'}
          </h1>
          <p className="text-lg opacity-80">
            {locale === 'ar' ? 'أعمالنا تتحدث عن نفسها — قصص نجاح حقيقية من عملائنا' : 'Our work speaks for itself — real success stories from our clients'}
          </p>

          {/* Quick stats */}
          {projects.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-10 max-w-lg mx-auto">
              {[
                { value: stats.total + '+', labelAr: 'مشروع', labelEn: 'Projects' },
                { value: stats.totalKw.toFixed(0) + ' kW', labelAr: 'مُركَّب', labelEn: 'Installed' },
                { value: '₪' + Math.round(stats.totalSaving / 1000) + 'K', labelAr: 'وفر سنوي', labelEn: 'Annual Saving' },
              ].map((s, i) => (
                <div key={i} className="rounded-xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="text-2xl font-black" style={{ color: 'var(--solar-gold)' }}>{s.value}</div>
                  <div className="text-sm opacity-75">{locale === 'ar' ? s.labelAr : s.labelEn}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {projects.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
            <Building className="h-16 w-16 mx-auto mb-4 opacity-30" style={{ color: 'var(--solar-gold)' }} />
            <p>{locale === 'ar' ? 'لا توجد مشاريع حالياً' : 'No projects yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => {
              const color = categoryColors[project.category] || 'var(--solar-gold)';
              const catLabel = categoryLabels[project.category]?.[locale as 'ar' | 'en'] || project.category;
              const title = getLocalized(project, 'title', locale);
              const desc = getLocalized(project, 'description', locale);

              return (
                <Link key={project.id} href={`/${locale}/projects/${project.slug}`}
                  className="group rounded-2xl overflow-hidden card-hover block"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  {/* Image */}
                  <div className="h-48 relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}>
                    <ImageWithFallback
                      src={project.coverImage}
                      alt={title}
                      className="absolute inset-0 w-full h-full object-cover"
                      fallback={
                        <div className="w-full h-full flex items-center justify-center">
                          <Zap className="h-16 w-16 opacity-30" style={{ color }} />
                        </div>
                      }
                    />
                    <div className="absolute top-4 start-4">
                      <Badge className="text-white text-xs font-semibold" style={{ backgroundColor: color }}>
                        {catLabel}
                      </Badge>
                    </div>
                    {project.isFeatured && (
                      <div className="absolute top-4 end-4">
                        <Badge variant="secondary" className="text-xs">⭐</Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 group-hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--text-primary)' }}>{title}</h3>
                    <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {desc}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <Zap className="h-4 w-4 flex-shrink-0" style={{ color }} />
                        {project.powerKw} kW · {project.panelsCount} {locale === 'ar' ? 'لوح' : 'panels'}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--eco-green)' }}>
                        <span>₪</span>
                        {project.annualSavingIls.toLocaleString()}/{locale === 'ar' ? 'سنة' : 'yr'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />{project.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(project.completionDate).getFullYear()}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
