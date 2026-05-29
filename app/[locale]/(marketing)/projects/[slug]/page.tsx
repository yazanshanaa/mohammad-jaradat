import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { MapPin, Zap, Calendar, Users, Leaf, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Props = { params: Promise<{ locale: string; slug: string }> };

const categoryColors: Record<string, string> = {
  RESIDENTIAL: 'var(--sky-blue)', COMMERCIAL: 'var(--solar-gold)',
  INDUSTRIAL: '#8B5CF6', AGRICULTURAL: 'var(--eco-green)',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const project = await prisma.project.findFirst({ where: { slug } });
    if (!project) return {};
    return { title: locale === 'ar' ? project.titleAr : project.titleEn };
  } catch { return {}; }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const isRTL = locale === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  let project: any = null;
  try {
    project = await prisma.project.findFirst({
      where: { slug },
      include: { system: true },
    });
  } catch { /* DB not connected */ }

  if (!project) notFound();

  const color = categoryColors[project.category] || 'var(--solar-gold)';
  const title = locale === 'ar' ? project.titleAr : project.titleEn;
  const desc = locale === 'ar' ? project.descriptionAr : project.descriptionEn;

  const categoryLabels: Record<string, { ar: string; en: string }> = {
    RESIDENTIAL: { ar: 'سكني', en: 'Residential' }, COMMERCIAL: { ar: 'تجاري', en: 'Commercial' },
    INDUSTRIAL: { ar: 'صناعي', en: 'Industrial' }, AGRICULTURAL: { ar: 'زراعي', en: 'Agricultural' },
  };
  const catLabel = categoryLabels[project.category]?.[locale as 'ar' | 'en'] || project.category;

  // CO2 estimate
  const co2Annual = Math.round(project.powerKw * 5.3 * 0.96 * 0.86 * 365 * 0.49);
  const trees = Math.round(co2Annual / 21);

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Link href={`/${locale}`} style={{ color: 'var(--solar-gold)' }} className="hover:opacity-80">
              {locale === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <ChevronRight className="h-4 w-4 rtl-flip" />
            <Link href={`/${locale}/projects`} style={{ color: 'var(--solar-gold)' }} className="hover:opacity-80">
              {locale === 'ar' ? 'المشاريع' : 'Projects'}
            </Link>
            <ChevronRight className="h-4 w-4 rtl-flip" />
            <span style={{ color: 'var(--text-primary)' }}>{title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero image */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <div className="h-72 flex items-center justify-center relative"
                style={{ background: `linear-gradient(135deg, ${color}22, ${color}55)` }}>
                <Zap className="h-24 w-24 opacity-30" style={{ color }} />
                <div className="absolute top-4 start-4">
                  <Badge className="text-white px-4 py-1 font-semibold" style={{ backgroundColor: color }}>{catLabel}</Badge>
                </div>
                {project.isFeatured && (
                  <div className="absolute top-4 end-4">
                    <Badge variant="secondary">⭐ {locale === 'ar' ? 'مميز' : 'Featured'}</Badge>
                  </div>
                )}
              </div>
              <div className="p-8" style={{ backgroundColor: 'var(--bg-card)' }}>
                <h1 className="text-3xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>{title}</h1>
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Zap, value: `${project.powerKw} kW`, labelAr: 'قدرة النظام', labelEn: 'System Power', color },
                { icon: Users, value: project.panelsCount, labelAr: 'لوح شمسي', labelEn: 'Solar Panels', color: 'var(--sky-blue)' },
                { icon: MapPin, value: project.location, labelAr: 'الموقع', labelEn: 'Location', color: 'var(--eco-green)' },
                { icon: Calendar, value: new Date(project.completionDate).getFullYear(), labelAr: 'سنة الإنجاز', labelEn: 'Completion', color: 'var(--solar-gold-dark)' },
              ].map(({ icon: Icon, value, labelAr, labelEn, color: c }) => (
                <div key={labelEn} className="rounded-2xl p-5 text-center"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${c}20` }}>
                    <Icon className="h-5 w-5" style={{ color: c }} />
                  </div>
                  <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{value}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {locale === 'ar' ? labelAr : labelEn}
                  </div>
                </div>
              ))}
            </div>

            {/* Savings */}
            <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'الأثر الاقتصادي والبيئي' : 'Economic & Environmental Impact'}
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-xl p-5 text-center" style={{ backgroundColor: 'rgba(0,184,148,0.1)' }}>
                  <div className="text-2xl font-black" style={{ color: 'var(--eco-green)' }}>
                    ₪{project.annualSavingIls.toLocaleString()}
                  </div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {locale === 'ar' ? 'وفر سنوي' : 'Annual Saving'}
                  </div>
                </div>
                <div className="rounded-xl p-5 text-center" style={{ backgroundColor: 'rgba(0,184,148,0.1)' }}>
                  <div className="text-2xl font-black" style={{ color: 'var(--eco-green)' }}>
                    {co2Annual.toLocaleString()} kg
                  </div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {locale === 'ar' ? 'CO₂ موفر/سنة' : 'CO₂ Saved/Year'}
                  </div>
                </div>
                <div className="rounded-xl p-5 text-center" style={{ backgroundColor: 'rgba(0,184,148,0.1)' }}>
                  <div className="flex items-center justify-center gap-2">
                    <Leaf className="h-6 w-6" style={{ color: 'var(--eco-green)' }} />
                    <span className="text-2xl font-black" style={{ color: 'var(--eco-green)' }}>{trees}</span>
                  </div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {locale === 'ar' ? 'شجرة معادلة' : 'Equivalent Trees'}
                  </div>
                </div>
              </div>
            </div>

            {/* Related system */}
            {project.system && (
              <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  {locale === 'ar' ? 'النظام المستخدم' : 'System Used'}
                </h3>
                <Link href={`/${locale}/systems/${project.system.slug}`}
                  className="flex items-center justify-between p-4 rounded-xl hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {locale === 'ar' ? project.system.titleAr : project.system.titleEn}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      ₪{project.system.pricePerWatt}/{locale === 'ar' ? 'واط' : 'W'}
                    </p>
                  </div>
                  <ArrowIcon className="h-5 w-5" style={{ color: 'var(--solar-gold)' }} />
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="rounded-2xl p-6 sticky top-24"
              style={{ backgroundColor: 'var(--bg-card)', border: `2px solid ${color}40` }}>
              <h3 className="font-bold text-lg mb-5" style={{ color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'هل تريد مشروعاً مشابهاً؟' : 'Want a Similar Project?'}
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                {locale === 'ar'
                  ? 'تواصل معنا واحصل على عرض سعر مجاني مخصص لاحتياجاتك'
                  : 'Contact us and get a free customized quote for your needs'}
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full font-bold text-white" style={{ backgroundColor: color }}>
                  <Link href={`/${locale}/contact`}>
                    {locale === 'ar' ? 'احصل على عرض مجاني' : 'Get Free Quote'}
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full font-semibold">
                  <Link href={`/${locale}/calculator`}>
                    {locale === 'ar' ? 'احسب توفيرك' : 'Calculate Savings'}
                  </Link>
                </Button>
              </div>

              {/* Project details list */}
              <div className="mt-6 space-y-3">
                {[
                  { labelAr: 'الموقع', labelEn: 'Location', value: project.location },
                  { labelAr: 'نوع المشروع', labelEn: 'Type', value: catLabel },
                  { labelAr: 'القدرة', labelEn: 'Power', value: `${project.powerKw} kW` },
                  { labelAr: 'عدد الألواح', labelEn: 'Panels', value: `${project.panelsCount} ${locale === 'ar' ? 'لوح' : 'panels'}` },
                  { labelAr: 'تاريخ الإنجاز', labelEn: 'Completion', value: new Date(project.completionDate).toLocaleDateString(locale === 'ar' ? 'ar-PS' : 'en-US', { year: 'numeric', month: 'long' }) },
                ].map(({ labelAr, labelEn, value }) => (
                  <div key={labelEn} className="flex justify-between text-sm py-2"
                    style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <span>{locale === 'ar' ? labelAr : labelEn}</span>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
