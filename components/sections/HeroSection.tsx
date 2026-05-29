'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calculator, Sun, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const features = [
    { icon: Sun, label: 'أجهزة عالية الجودة' },
    { icon: Zap, label: 'تركيب احترافي' },
    { icon: Shield, label: 'ضمان سنوات' },
  ];

  return (
    <section
      className="relative min-h-[90vh] flex items-center overflow-hidden -mt-16"
      style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 60%, #0F4C81 100%)' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--solar-gold) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 -left-32 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, var(--sky-blue) 0%, transparent 70%)' }}
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ backgroundColor: 'rgba(245, 166, 35, 0.2)', color: 'var(--solar-gold)', border: '1px solid rgba(245, 166, 35, 0.3)' }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Sun className="h-4 w-4" />
              🇵🇸 الشركة الرائدة في فلسطين
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              طاقة شمسية
              <br />
              لمستقبل{' '}
              <span
                className="relative inline-block"
                style={{ color: 'var(--solar-gold)' }}
              >
                أفضل
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-1 rounded-full"
                  style={{ backgroundColor: 'var(--solar-gold)' }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-lg">
              نصمم ونركب أنظمة الطاقة الشمسية المتكاملة لمنزلك وعملك بأعلى جودة وأفضل أسعار في فلسطين
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Button
                asChild
                size="lg"
                className="font-bold text-white shadow-lg px-8"
                style={{ backgroundColor: 'var(--solar-gold)' }}
              >
                <Link href="/contact">
                  احصل على عرض سعر
                  <ArrowLeft className="h-4 w-4 ms-2" />
                </Link>
              </Button>
              <Link href="/calculator">
                <Button
                  variant="outline"
                  size="lg"
                  className="font-semibold px-8"
                  style={{
                    borderColor: 'rgba(255,255,255,0.4)',
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Calculator className="h-4 w-4 me-2" />
                  احسب توفيرك
                </Button>
              </Link>
            </div>

            {/* Quick Features */}
            <div className="flex flex-wrap gap-4">
              {features.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Icon className="h-4 w-4" style={{ color: 'var(--solar-gold)' }} />
                  <span className="text-sm text-white font-medium">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
          >
            <div className="relative flex items-center justify-center">
              <motion.div
                className="w-72 h-72 rounded-full flex items-center justify-center"
                style={{ background: 'radial-gradient(circle, rgba(245, 166, 35, 0.3) 0%, transparent 70%)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute w-40 h-40 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--solar-gold), var(--solar-gold-dark))' }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sun className="h-20 w-20 text-white" />
              </motion.div>

              {/* Orbit cards */}
              {[
                { angle: 0, value: '90%', label: 'توفير في الفاتورة', color: 'var(--eco-green)' },
                { angle: 120, value: '25', label: 'سنة ضمان', color: 'var(--sky-blue)' },
                { angle: 240, value: '45+', label: 'مشروع منجز', color: 'var(--solar-gold)' },
              ].map(({ angle, value, label, color }) => {
                const rad = (angle * Math.PI) / 180;
                const r = 150;
                const x = Math.cos(rad) * r;
                const y = Math.sin(rad) * r;
                return (
                  <motion.div
                    key={label}
                    className="absolute rounded-xl px-4 py-3 text-center shadow-xl"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      left: `calc(50% + ${Math.round(x)}px - 60px)`,
                      top: `calc(50% + ${Math.round(y)}px - 35px)`,
                      width: 120,
                    }}
                    suppressHydrationWarning
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: angle / 120,
                      ease: 'easeInOut',
                    }}
                  >
                    <div className="text-xl font-black" style={{ color }}>
                      {value}
                    </div>
                    <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"
            fill="var(--bg-primary)"
          />
        </svg>
      </div>
    </section>
  );
}
