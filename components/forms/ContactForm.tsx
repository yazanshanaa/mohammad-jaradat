'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { contactSchema, type ContactInput } from '@/lib/validations';
import { toast } from 'sonner';

export function ContactForm() {
  const t = useTranslations('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success(t('success'));
        reset();
      } else {
        toast.error(t('error'));
      }
    } catch {
      toast.error(t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldStyle = {
    backgroundColor: 'var(--bg-card)',
    borderColor: 'var(--border)',
    color: 'var(--text-primary)',
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label style={{ color: 'var(--text-primary)' }}>{t('name')} *</Label>
          <Input
            {...register('name')}
            placeholder={t('namePlaceholder')}
            style={fieldStyle}
            className="h-12"
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label style={{ color: 'var(--text-primary)' }}>{t('phone')} *</Label>
          <Input
            {...register('phone')}
            placeholder={t('phonePlaceholder')}
            type="tel"
            style={fieldStyle}
            className="h-12"
          />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label style={{ color: 'var(--text-primary)' }}>{t('email')}</Label>
        <Input
          {...register('email')}
          placeholder={t('emailPlaceholder')}
          type="email"
          style={fieldStyle}
          className="h-12"
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label style={{ color: 'var(--text-primary)' }}>{t('message')} *</Label>
        <Textarea
          {...register('message')}
          placeholder={t('messagePlaceholder')}
          rows={5}
          style={fieldStyle}
          className="resize-none"
        />
        {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 font-bold text-white text-base"
        style={{ backgroundColor: 'var(--solar-gold)' }}
      >
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 me-2 animate-spin" />{t('sending')}</>
        ) : (
          <><Send className="h-4 w-4 me-2" />{t('send')}</>
        )}
      </Button>
    </form>
  );
}
