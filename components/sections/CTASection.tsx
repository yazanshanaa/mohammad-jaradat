'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calculator, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CTASectionProps {
  locale: string;
}

export function CTASection({ locale }: CTASectionProps) {
  const t = useTranslations('cta');
  const isRTL = locale === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -start-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--solar-gold), transparent)' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-20 -end-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--sky-blue), transparent)' }}
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
            {t('title')}
          </h2>
          <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {t('subtitle')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="font-bold text-white shadow-xl px-8 text-base"
              style={{ backgroundColor: 'var(--solar-gold)' }}
            >
              <Link href={`/${locale}/contact`}>
                {t('primary')}
                <ArrowIcon className="h-4 w-4 ms-2" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="font-semibold px-8 text-base"
              style={{
                borderColor: 'rgba(255,255,255,0.4)',
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
              }}
            >
              <Link href={`/${locale}/calculator`}>
                <Calculator className="h-4 w-4 me-2" />
                {t('calculator')}
              </Link>
            </Button>

            <a
              href="tel:+970591234567"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base transition-all hover:opacity-80"
              style={{ color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <Phone className="h-4 w-4" />
              {t('secondary')}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
