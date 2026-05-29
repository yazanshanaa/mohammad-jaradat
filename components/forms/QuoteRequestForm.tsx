'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Zap, ChevronRight, ChevronLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { LOCATIONS } from '@/lib/calculator';

interface QuoteRequestFormProps {
  calculatorResult?: object;
  onClose?: () => void;
}

const USAGE_TYPES = [
  { value: 'RESIDENTIAL', iconAr: '🏠 منزل', iconEn: '🏠 Home' },
  { value: 'COMMERCIAL', iconAr: '🏢 تجاري', iconEn: '🏢 Commercial' },
  { value: 'INDUSTRIAL', iconAr: '🏭 مصنع', iconEn: '🏭 Industrial' },
  { value: 'AGRICULTURAL', iconAr: '🌾 زراعي', iconEn: '🌾 Agricultural' },
];

export function QuoteRequestForm({ calculatorResult, onClose }: QuoteRequestFormProps) {
  const locale = useLocale();
  const t = useTranslations('quote');
  const isRTL = locale === 'ar';

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '',
    location: '', usageType: 'RESIDENTIAL',
    monthlyBillIls: '', notes: '',
  });

  const update = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          monthlyBillIls: parseFloat(formData.monthlyBillIls) || 0,
          calculatorResult: calculatorResult || null,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success(t('success'));
      } else {
        toast.error(locale === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.');
      }
    } catch {
      toast.error(locale === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--bg-primary)',
    borderColor: 'var(--border)',
    color: 'var(--text-primary)',
    height: '48px',
  };

  const steps = [
    { num: 1, labelAr: 'البيانات الشخصية', labelEn: 'Personal Info', icon: User },
    { num: 2, labelAr: 'معلومات الموقع', labelEn: 'Location Info', icon: MapPin },
    { num: 3, labelAr: 'تفاصيل الاستهلاك', labelEn: 'Usage Details', icon: Zap },
    { num: 4, labelAr: 'تأكيد', labelEn: 'Confirm', icon: CheckCircle },
  ];

  if (submitted) {
    return (
      <div className="text-center py-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}>
          <CheckCircle className="h-20 w-20 mx-auto mb-6" style={{ color: 'var(--eco-green)' }} />
        </motion.div>
        <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          {locale === 'ar' ? 'تم استلام طلبك!' : 'Request Received!'}
        </h3>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>{t('success')}</p>
        {onClose && (
          <Button onClick={onClose} className="font-semibold text-white" style={{ backgroundColor: 'var(--solar-gold)' }}>
            {locale === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Steps indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = s.num === step;
          const isDone = s.num < step;
          return (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    backgroundColor: isDone ? 'var(--eco-green)' : isActive ? 'var(--solar-gold)' : 'var(--bg-primary)',
                    border: `2px solid ${isDone ? 'var(--eco-green)' : isActive ? 'var(--solar-gold)' : 'var(--border)'}`,
                  }}
                >
                  {isDone ? (
                    <CheckCircle className="h-5 w-5 text-white" />
                  ) : (
                    <Icon className="h-5 w-5" style={{ color: isActive ? 'white' : 'var(--text-secondary)' }} />
                  )}
                </div>
                <span className="text-xs mt-1 hidden sm:block" style={{ color: isActive ? 'var(--solar-gold)' : 'var(--text-secondary)' }}>
                  {locale === 'ar' ? s.labelAr : s.labelEn}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2" style={{ backgroundColor: isDone ? 'var(--eco-green)' : 'var(--border)' }} />
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-5"
        >
          {step === 1 && (
            <>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'البيانات الشخصية' : 'Personal Details'}
              </h3>
              <div className="space-y-2">
                <Label style={{ color: 'var(--text-primary)' }}>{t('name')} *</Label>
                <Input value={formData.name} onChange={e => update('name', e.target.value)}
                  placeholder={locale === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'} style={inputStyle} />
              </div>
              <div className="space-y-2">
                <Label style={{ color: 'var(--text-primary)' }}>{t('phone')} *</Label>
                <Input value={formData.phone} onChange={e => update('phone', e.target.value)}
                  placeholder="0591234567" type="tel" style={inputStyle} />
              </div>
              <div className="space-y-2">
                <Label style={{ color: 'var(--text-primary)' }}>{t('email')}</Label>
                <Input value={formData.email} onChange={e => update('email', e.target.value)}
                  placeholder="example@email.com" type="email" style={inputStyle} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'معلومات الموقع' : 'Location Info'}
              </h3>
              <div className="space-y-2">
                <Label style={{ color: 'var(--text-primary)' }}>{t('location')} *</Label>
                <select
                  value={formData.location} onChange={e => update('location', e.target.value)}
                  className="w-full rounded-md px-3 text-sm"
                  style={{ ...inputStyle, border: '1px solid var(--border)' }}
                >
                  <option value="">{locale === 'ar' ? 'اختر المنطقة' : 'Select region'}</option>
                  {LOCATIONS.map(l => (
                    <option key={l.value} value={l.value}>
                      {locale === 'ar' ? l.labelAr : l.labelEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label style={{ color: 'var(--text-primary)' }}>{t('usageType')}</Label>
                <div className="grid grid-cols-2 gap-3">
                  {USAGE_TYPES.map(u => (
                    <button key={u.value} type="button" onClick={() => update('usageType', u.value)}
                      className="p-4 rounded-xl text-sm font-medium transition-all text-center"
                      style={{
                        backgroundColor: formData.usageType === u.value ? 'rgba(245,166,35,0.15)' : 'var(--bg-primary)',
                        border: `2px solid ${formData.usageType === u.value ? 'var(--solar-gold)' : 'var(--border)'}`,
                        color: formData.usageType === u.value ? 'var(--solar-gold)' : 'var(--text-secondary)',
                      }}>
                      {locale === 'ar' ? u.iconAr : u.iconEn}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'تفاصيل الاستهلاك' : 'Usage Details'}
              </h3>
              <div className="space-y-2">
                <Label style={{ color: 'var(--text-primary)' }}>{t('monthlyBill')} *</Label>
                <div className="relative">
                  <span className="absolute start-3 top-1/2 -translate-y-1/2 font-bold" style={{ color: 'var(--solar-gold)' }}>₪</span>
                  <Input value={formData.monthlyBillIls} onChange={e => update('monthlyBillIls', e.target.value)}
                    placeholder="500" type="number" className="ps-8" style={inputStyle} />
                </div>
              </div>
              <div className="space-y-2">
                <Label style={{ color: 'var(--text-primary)' }}>
                  {t('notes')} <span className="text-xs opacity-60">({locale === 'ar' ? 'اختياري' : 'Optional'})</span>
                </Label>
                <Textarea value={formData.notes} onChange={e => update('notes', e.target.value)}
                  placeholder={locale === 'ar' ? 'أي معلومات إضافية تريد مشاركتها...' : 'Any additional information...'}
                  rows={3} style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {locale === 'ar' ? 'تأكيد الطلب' : 'Confirm Request'}
              </h3>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {[
                  { labelAr: 'الاسم', labelEn: 'Name', value: formData.name },
                  { labelAr: 'الهاتف', labelEn: 'Phone', value: formData.phone },
                  { labelAr: 'البريد الإلكتروني', labelEn: 'Email', value: formData.email || '-' },
                  { labelAr: 'المنطقة', labelEn: 'Location', value: LOCATIONS.find(l => l.value === formData.location)?.[locale === 'ar' ? 'labelAr' : 'labelEn'] || '-' },
                  { labelAr: 'نوع الاستخدام', labelEn: 'Usage Type', value: USAGE_TYPES.find(u => u.value === formData.usageType)?.[locale === 'ar' ? 'iconAr' : 'iconEn'] || '-' },
                  { labelAr: 'الفاتورة الشهرية', labelEn: 'Monthly Bill', value: formData.monthlyBillIls ? `₪${formData.monthlyBillIls}` : '-' },
                ].map(({ labelAr, labelEn, value }) => (
                  <div key={labelEn} className="flex justify-between px-4 py-3"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{locale === 'ar' ? labelAr : labelEn}</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
                  </div>
                ))}
              </div>
              {calculatorResult && (
                <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: 'rgba(0,184,148,0.1)', color: 'var(--eco-green)' }}>
                  ✅ {locale === 'ar' ? 'ستُرسل نتيجة الحاسبة مع طلبك' : 'Calculator results will be included with your request'}
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1 font-semibold h-12">
            {isRTL ? <ChevronRight className="h-4 w-4 me-1" /> : <ChevronLeft className="h-4 w-4 me-1" />}
            {locale === 'ar' ? 'رجوع' : 'Back'}
          </Button>
        )}
        {step < 4 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={
              (step === 1 && (!formData.name || !formData.phone)) ||
              (step === 2 && !formData.location) ||
              (step === 3 && !formData.monthlyBillIls)
            }
            className="flex-1 font-bold text-white h-12"
            style={{ backgroundColor: 'var(--solar-gold)' }}
          >
            {locale === 'ar' ? 'التالي' : 'Next'}
            {isRTL ? <ChevronLeft className="h-4 w-4 ms-1" /> : <ChevronRight className="h-4 w-4 ms-1" />}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 font-bold text-white h-12"
            style={{ backgroundColor: 'var(--eco-green)' }}
          >
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 me-2 animate-spin" />{locale === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}</>
            ) : (
              <><CheckCircle className="h-4 w-4 me-2" />{t('submit')}</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
