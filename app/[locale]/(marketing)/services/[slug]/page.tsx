import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Check, Zap, Settings, MessageCircle, Monitor, CreditCard, ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = { params: Promise<{ locale: string; slug: string }> };

const iconMap: Record<string, any> = { Zap, Settings, MessageCircle, Monitor, CreditCard };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const service = await prisma.service.findFirst({ where: { slug } });
    if (!service) return {};
    return {
      title: locale === 'ar' ? service.titleAr : service.titleEn,
    };
  } catch {
    return {};
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const isRTL = locale === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  let service: any = null;
  try {
    service = await prisma.service.findFirst({ where: { slug } });
  } catch { /* DB not connected */ }

  if (!service) notFound();

  const Icon = iconMap[service.icon] || Zap;
  const title = locale === 'ar' ? service.titleAr : service.titleEn;
  const desc = locale === 'ar' ? service.descriptionAr : service.descriptionEn;
  const features = Array.isArray(service.features) ? service.features : [];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Link href={`/${locale}`} style={{ color: 'var(--solar-gold)' }}>
              {locale === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/${locale}/services`} style={{ color: 'var(--solar-gold)' }}>
              {locale === 'ar' ? 'الخدمات' : 'Services'}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span style={{ color: 'var(--text-primary)' }}>{title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="rounded-2xl p-8 mb-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-start gap-6 mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--solar-gold)20' }}>
              <Icon className="h-8 w-8" style={{ color: 'var(--solar-gold)' }} />
            </div>
            <div>
              <h1 className="text-3xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>{title}</h1>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
            </div>
          </div>
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div className="rounded-2xl p-8 mb-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              {locale === 'ar' ? 'ما يشمله هذا الخدمة' : 'What This Service Includes'}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((f: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl"
                  style={{ backgroundColor: 'rgba(245,166,35,0.08)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'rgba(245,166,35,0.2)' }}>
                    <Check className="h-4 w-4" style={{ color: 'var(--solar-gold)' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {locale === 'ar' ? f.ar : f.en}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {locale === 'ar' ? 'هل أنت مهتم بهذه الخدمة؟' : 'Interested in This Service?'}
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            {locale === 'ar'
              ? 'تواصل معنا اليوم للحصول على استشارة مجانية وعرض سعر مخصص'
              : 'Contact us today for a free consultation and custom quote'}
          </p>
          <Button asChild className="font-bold text-white" style={{ backgroundColor: 'var(--solar-gold)' }}>
            <Link href={`/${locale}/contact`}>
              {locale === 'ar' ? 'احصل على استشارة مجانية' : 'Get a Free Consultation'}
              <ArrowIcon className="h-4 w-4 ms-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
