'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import type { TestimonialItem } from './TestimonialsSlider';

interface Props {
  testimonials: TestimonialItem[];
  locale: string;
}

export function TestimonialsCards({ testimonials, locale }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {testimonials.map((item, index) => (
        <motion.div
          key={index}
          className="rounded-2xl p-6 relative card-hover"
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div
            className="absolute top-4 end-4 w-10 h-10 rounded-full flex items-center justify-center opacity-20"
            style={{ backgroundColor: 'var(--solar-gold)' }}
          >
            <Quote className="h-5 w-5" style={{ color: 'var(--solar-gold)' }} />
          </div>

          <div className="flex gap-1 mb-4">
            {Array.from({ length: item.rating }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" style={{ color: 'var(--solar-gold)' }} />
            ))}
          </div>

          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            {locale === 'ar' ? item.contentAr : item.contentEn}
          </p>

          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, var(--solar-gold), var(--solar-gold-dark))' }}
            >
              {(locale === 'ar' ? item.nameAr : item.nameEn)[0]}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {locale === 'ar' ? item.nameAr : item.nameEn}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {locale === 'ar' ? item.titleAr : item.titleEn}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
