'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { SectionTitle } from '@/components/shared/SectionTitle';

interface TestimonialsSliderProps {
  locale: string;
}

const TESTIMONIALS = [
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

export function TestimonialsSlider({ locale }: TestimonialsSliderProps) {
  const t = useTranslations('testimonials');

  return (
    <section
      className="section-padding"
      style={{ backgroundColor: 'var(--bg-card)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle title={t('title')} subtitle={t('subtitle')} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, index) => (
            <motion.div
              key={index}
              className="rounded-2xl p-6 relative card-hover"
              style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Quote icon */}
              <div
                className="absolute top-4 end-4 w-10 h-10 rounded-full flex items-center justify-center opacity-20"
                style={{ backgroundColor: 'var(--solar-gold)' }}
              >
                <Quote className="h-5 w-5" style={{ color: 'var(--solar-gold)' }} />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-current"
                    style={{ color: 'var(--solar-gold)' }}
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                {locale === 'ar' ? t.contentAr : t.contentEn}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg, var(--solar-gold), var(--solar-gold-dark))' }}
                >
                  {(locale === 'ar' ? t.nameAr : t.nameEn)[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {locale === 'ar' ? t.nameAr : t.nameEn}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {locale === 'ar' ? t.titleAr : t.titleEn}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
