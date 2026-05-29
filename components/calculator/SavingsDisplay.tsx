'use client';

import { useEffect, useState, useRef } from 'react';
import { CalculatorResult } from '@/lib/calculator';
import { TrendingUp, Zap, Leaf } from 'lucide-react';

interface SavingsDisplayProps {
  result: CalculatorResult;
}

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  color,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: number;
  suffix: string;
  color: string;
  delay?: number;
}) {
  const [active, setActive] = useState(false);
  const animated = useCountUp(active ? value : 0, 1500 + delay);

  useEffect(() => {
    const t = setTimeout(() => setActive(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2 transition-all duration-300 hover:scale-105"
      style={{ backgroundColor: `${color}15`, border: `1px solid ${color}40` }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}25` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color }}>
          {animated.toLocaleString()}
          <span className="text-sm ms-1 font-normal" style={{ color: 'var(--text-secondary)' }}>
            {suffix}
          </span>
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export function SavingsDisplay({ result }: SavingsDisplayProps) {
  const stats = [
    {
      icon: TrendingUp,
      label: 'وفر سنوي',
      value: result.annualSavingIls,
      suffix: '₪/سنة',
      color: 'var(--solar-gold)',
      delay: 0,
    },
    {
      icon: Zap,
      label: 'إنتاج سنوي',
      value: result.annualProductionKwh,
      suffix: 'كيلوواط',
      color: 'var(--sky-blue)',
      delay: 150,
    },
    {
      icon: Leaf,
      label: 'CO₂ موفر سنوياً',
      value: result.co2SavedAnnualKg,
      suffix: 'كغ',
      color: 'var(--eco-green)',
      delay: 300,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
