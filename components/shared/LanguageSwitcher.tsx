'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    // Replace the current locale in the pathname
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={switchLocale}
      className="flex items-center gap-1.5 text-sm font-medium"
      aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
    >
      <Globe className="h-4 w-4" />
      <span>{locale === 'ar' ? 'EN' : 'عربي'}</span>
    </Button>
  );
}
