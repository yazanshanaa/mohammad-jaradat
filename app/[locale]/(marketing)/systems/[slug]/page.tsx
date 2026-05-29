import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Zap, ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Props = { params: Promise<{ locale: string; slug: string }> };

const typeColors: Record<string, string> = {
  ON_GRID: 'var(--sky-blue)', OFF_GRID: 'var(--eco-green)',
  HYBRID: 'var(--solar-gold)', AGRICULTURAL: '#8B5CF6', COMMERCIAL: 'var(--navy-light)',
};

const typeLabels: Record<string, string> = {
  ON_GRID: 'متصل بالشبكة',
  OFF_GRID: 'منفصل عن الشبكة',
  HYBRID: 'هجين',
  AGRICULTURAL: 'زراعي',
  COMMERCIAL: 'تجاري',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const system = await prisma.solarSystem.findFirst({ where: { slug } });
    if (!system) return {};
    return {
      title: system.titleAr,
      description: system.descriptionAr.slice(0, 160),
    };
  } catch { return {}; }
}

export default async function SystemDetailPage({ params }: Props) {
  const { locale, slug } = await params;

  let system: any = null;
  try {
    system = await prisma.solarSystem.findFirst({
      where: { slug },
      include: { projects: { where: { isActive: true }, take: 3 } },
    });
  } catch { /* DB not connected */ }

  if (!system && slug !== 'demo') notFound();

  if (!system) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center" style={{ color: 'var(--text-secondary)' }}>
        <p>الصفحة تحتاج لتوصيل قاعدة البيانات</p>
      </div>
    );
  }

  const color = typeColors[system.type] || 'var(--solar-gold)';
  const title = system.titleAr || system.titleEn;
  const desc = system.descriptionAr || system.descriptionEn;
  const features = Array.isArray(system.features) ? system.features : [];
  const specs = typeof system.specs === 'object' ? system.specs : {};
  const typeLabel = typeLabels[system.type] || system.type;

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Link href="/" style={{ color: 'var(--solar-gold)' }}>الرئيسية</Link>
            <ChevronRight className="h-4 w-4 rtl-flip" />
            <Link href={`/${locale}/systems`} style={{ color: 'var(--solar-gold)' }}>الأنظمة</Link>
            <ChevronRight className="h-4 w-4 rtl-flip" />
            <span style={{ color: 'var(--text-primary)' }}>{title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">

        {/* بطاقة الهيرو مع الصورة */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {/* صورة توضيحية */}
          {system.coverImage ? (
            <div className="relative w-full h-72 sm:h-96">
              <Image
                src={system.coverImage}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 900px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 start-6">
                <Badge className="text-white px-4 py-1 text-sm font-semibold" style={{ backgroundColor: color }}>
                  {typeLabel}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${color}22, ${color}55)` }}>
              <div className="text-center">
                <div className="w-28 h-28 rounded-3xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${color}33` }}>
                  <Zap className="h-14 w-14" style={{ color }} />
                </div>
                <Badge className="text-white px-4 py-1 text-sm font-semibold" style={{ backgroundColor: color }}>
                  {typeLabel}
                </Badge>
              </div>
            </div>
          )}

          {/* العنوان والوصف */}
          <div className="p-8">
            <h1 className="text-3xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>{title}</h1>
            <p className="text-base leading-loose text-justify" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '2' }}>
              {desc}
            </p>
          </div>
        </div>

        {/* المزايا */}
        {features.length > 0 && (
          <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              مزايا النظام
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((f: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl"
                  style={{ backgroundColor: `${color}10` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}20` }}>
                    <Check className="h-4 w-4" style={{ color }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {f.ar || f.en || f}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* المواصفات التقنية */}
        {Object.keys(specs).length > 0 && (
          <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              المواصفات التقنية
            </h2>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {Object.entries(specs).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-3">
                  <span className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* مشاريع بهذا النظام */}
        {system.projects?.length > 0 && (
          <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              مشاريع بهذا النظام
            </h2>
            <div className="space-y-3">
              {system.projects.map((project: any) => (
                <Link key={project.id} href={`/${locale}/projects/${project.slug}`}
                  className="flex items-center justify-between p-4 rounded-xl hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {project.titleAr || project.titleEn}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {project.location} — {project.powerKw} kW
                    </p>
                  </div>
                  <ArrowLeft className="h-4 w-4 flex-shrink-0" style={{ color }} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* أزرار التواصل */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1 font-bold text-white h-12 text-base" style={{ backgroundColor: color }}>
            <Link href={`/${locale}/contact`}>
              احصل على عرض سعر
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 h-12 font-semibold">
            <Link href={`/${locale}/calculator`}>
              احسب توفيرك
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
