'use client';

import { useLocale } from 'next-intl';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { YearlyData } from '@/lib/calculator';

interface ResultsChartProps {
  data: YearlyData[];
  cost: number;
}

export function ResultsChart({ data, cost }: ResultsChartProps) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  const chartData = data.map((d) => ({
    year: isAr ? `س${d.year}` : `Y${d.year}`,
    yearNum: d.year,
    [isAr ? 'الوفر السنوي' : 'Annual Saving']: d.savingIls,
    [isAr ? 'الوفر التراكمي' : 'Cumulative Saving']: d.cumulativeSavingIls,
  }));

  const annualKey = isAr ? 'الوفر السنوي' : 'Annual Saving';
  const cumulativeKey = isAr ? 'الوفر التراكمي' : 'Cumulative Saving';

  const formatIls = (v: number) =>
    v >= 1000
      ? `${isAr ? '₪' : '₪'}${(v / 1000).toFixed(0)}K`
      : `₪${v}`;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
          <XAxis
            dataKey="year"
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            tickFormatter={formatIls}
            width={55}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              color: 'var(--text-primary)',
            }}
            formatter={(value: any, name: any) => [
              `₪${Number(value).toLocaleString()}`,
              name,
            ]}
          />
          <Legend
            wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 12 }}
          />
          <ReferenceLine
            y={0}
            stroke="var(--border)"
            strokeDasharray="4 4"
          />
          <ReferenceLine
            y={cost}
            stroke="var(--solar-gold)"
            strokeDasharray="4 4"
            label={{
              value: isAr ? 'التكلفة الأولية' : 'Initial Cost',
              fill: 'var(--solar-gold)',
              fontSize: 11,
            }}
          />
          <Bar
            dataKey={annualKey}
            fill="var(--sky-blue)"
            opacity={0.8}
            radius={[3, 3, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey={cumulativeKey}
            stroke="var(--eco-green)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: 'var(--eco-green)' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <p className="text-xs text-center mt-2" style={{ color: 'var(--text-secondary)' }}>
        {isAr
          ? 'الخط الأخضر يتقاطع مع الصفر عند نقطة الاسترداد'
          : 'Green line crosses zero at the payback point'}
      </p>
    </div>
  );
}
