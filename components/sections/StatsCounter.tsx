'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { Award, BarChart3, Zap, Users } from 'lucide-react';

interface StatsCounterProps {
  locale: string;
}

export function StatsCounter({ locale: _locale }: StatsCounterProps) {
  const t = useTranslations('stats');

  const stats = [
    { value: 10, suffix: '+', label: t('years'), icon: Award, color: 'var(--solar-gold)' },
    { value: 45, suffix: '', label: t('projects'), icon: BarChart3, color: 'var(--sky-blue)' },
    { value: 5000, suffix: '+', label: t('kw'), icon: Zap, color: 'var(--eco-green)' },
    { value: 450, suffix: '+', label: t('clients'), icon: Users, color: 'var(--solar-gold-dark)' },
  ];

  return (
    <section className="py-16" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="rounded-2xl p-6 text-center card-hover"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon className="h-6 w-6" style={{ color: stat.color }} />
                </div>
                <div className="text-3xl font-black mb-1" style={{ color: stat.color }}>
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                  />
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
