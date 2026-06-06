import { getTranslations } from 'next-intl/server';
import { Star, Quote } from 'lucide-react';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { prisma } from '@/lib/prisma';
import { TestimonialsCards } from './TestimonialsCards';

interface TestimonialsSliderProps {
  locale: string;
}

const FALLBACK_TESTIMONIALS = [
  {
    nameAr: 'محمد أبو خضر', nameEn: 'Mohammad Abu Khader',
    titleAr: 'صاحب منزل - رام الله', titleEn: 'Homeowner - Ramallah',
    contentAr: 'تجربة رائعة مع سولار برو. ركّبوا النظام في يومين فقط والفاتورة انخفضت من 800 شيكل لأقل من 100 شيكل شهرياً!',
    contentEn: 'Amazing experience with SolarPro. They installed the system in just two days and my bill dropped from 800 to less than 100 NIS monthly!',
    rating: 5,
  },
  {
    nameAr: 'ليلى عبد الرحمن', nameEn: 'Layla Abdul Rahman',
    titleAr: 'صاحبة مشغل - نابلس', titleEn: 'Workshop Owner - Nablus',
    contentAr: 'النظام الشمسي غيّر حياتنا في الشغل. ما عدنا نخاف من انقطاع الكهرباء أو الفواتير الباهظة.',
    contentEn: 'The solar system changed our work life. We no longer fear power outages or high bills.',
    rating: 5,
  },
  {
    nameAr: 'خالد المصري', nameEn: 'Khaled Al-Masri',
    titleAr: 'مزارع - أريحا', titleEn: 'Farmer - Jericho',
    contentAr: 'الحل الأمثل لمزرعتي. ضخ المياه أصبح مجانياً تقريباً وأنا أوفر آلاف الشواكل كل شهر.',
    contentEn: 'The perfect solution for my farm. Water pumping is now almost free and I save thousands of shekels every month.',
    rating: 5,
  },
];

export type TestimonialItem = typeof FALLBACK_TESTIMONIALS[0];

export async function TestimonialsSlider({ locale }: TestimonialsSliderProps) {
  const t = await getTranslations('testimonials');

  let testimonials: TestimonialItem[] = [];
  try {
    const rows = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
      take: 6,
    });
    testimonials = rows.length > 0
      ? rows.map(r => ({
          nameAr: r.nameAr, nameEn: r.nameEn,
          titleAr: r.titleAr, titleEn: r.titleEn,
          contentAr: r.contentAr, contentEn: r.contentEn,
          rating: r.rating,
        }))
      : FALLBACK_TESTIMONIALS;
  } catch {
    testimonials = FALLBACK_TESTIMONIALS;
  }

  return (
    <section className="section-padding" style={{ backgroundColor: 'var(--bg-card)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title={t('title')} subtitle={t('subtitle')} />
        <TestimonialsCards testimonials={testimonials} locale={locale} />
      </div>
    </section>
  );
}

export { Star, Quote };
