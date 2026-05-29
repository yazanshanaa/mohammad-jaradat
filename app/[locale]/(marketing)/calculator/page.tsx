import { getTranslations } from 'next-intl/server';
import { SolarCalculator } from '@/components/calculator/SolarCalculator';
import { Sun, Zap, TrendingUp, Shield } from 'lucide-react';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'حاسبة الطاقة الشمسية | SolarPro' : 'Solar Calculator | SolarPro',
    description: locale === 'ar'
      ? 'احسب حجم النظام الشمسي المثالي لمنزلك أو شركتك واكتشف وفرك المالي خلال 25 سنة'
      : 'Calculate the ideal solar system size for your home or business and discover your 25-year savings',
  };
}

export default async function CalculatorPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const _t = await getTranslations('calculator');

  const features = [
    {
      icon: Zap,
      titleAr: 'دقة عالية',
      titleEn: 'High Accuracy',
      descAr: 'حسابات مبنية على بيانات شمس فلسطين الفعلية',
      descEn: 'Calculations based on actual Palestinian sun data',
      color: 'var(--solar-gold)',
    },
    {
      icon: TrendingUp,
      titleAr: 'تحليل 25 سنة',
      titleEn: '25-Year Analysis',
      descAr: 'تحليل مالي تفصيلي لعائد الاستثمار كاملاً',
      descEn: 'Detailed financial ROI analysis',
      color: 'var(--sky-blue)',
    },
    {
      icon: Shield,
      titleAr: 'مجاني تماماً',
      titleEn: 'Completely Free',
      descAr: 'لا حاجة للتسجيل أو دفع أي رسوم',
      descEn: 'No registration or fees required',
      color: 'var(--eco-green)',
    },
    {
      icon: Sun,
      titleAr: 'فوري',
      titleEn: 'Instant',
      descAr: 'نتائج فورية خلال ثوانٍ',
      descEn: 'Results in seconds',
      color: '#8B5CF6',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="hero-gradient py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ backgroundColor: 'rgba(245,166,35,0.15)', color: 'var(--solar-gold)', border: '1px solid rgba(245,166,35,0.3)' }}
          >
            <Sun className="h-4 w-4" />
            {isAr ? 'حاسبة الطاقة الشمسية المجانية' : 'Free Solar Energy Calculator'}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {isAr ? (
              <>احسب <span style={{ color: 'var(--solar-gold)' }}>وفرك</span> من الطاقة الشمسية</>
            ) : (
              <>Calculate Your <span style={{ color: 'var(--solar-gold)' }}>Solar Savings</span></>
            )}
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {isAr
              ? 'أدخل بياناتك واحصل على تحليل مفصل لحجم النظام المثالي والعائد المالي خلال 25 سنة'
              : 'Enter your data and get a detailed analysis of the ideal system size and financial return over 25 years'}
          </p>
        </div>
      </div>

      {/* Features strip */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, titleAr, titleEn, descAr, descEn, color }) => (
              <div key={titleEn} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20` }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {isAr ? titleAr : titleEn}
                  </div>
                  <div className="text-xs hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
                    {isAr ? descAr : descEn}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calculator */}
      <div className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-3xl mx-auto px-4">
          <SolarCalculator />
        </div>
      </div>

    </div>
  );
}
