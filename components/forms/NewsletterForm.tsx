'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function NewsletterForm() {
  const t = useTranslations('newsletter');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
        toast.success(t('success'));
      } else {
        toast.error(t('error'));
      }
    } catch {
      toast.error(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-3 text-white">
        <CheckCircle className="h-6 w-6" style={{ color: 'var(--eco-green)' }} />
        <span className="font-medium">{t('success')}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" style={{ color: 'var(--text-secondary)' }} />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('placeholder')}
          className="ps-10 h-11"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
          required
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="h-11 font-semibold text-white px-6"
        style={{ backgroundColor: 'var(--solar-gold)' }}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('subscribe')}
      </Button>
    </form>
  );
}
