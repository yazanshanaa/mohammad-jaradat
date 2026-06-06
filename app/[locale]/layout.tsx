import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getSettings } from '@/lib/settings';
import '../globals.css';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const settings = await getSettings();

  const siteName = settings['site_name_ar'] || settings['site_name_en'] || t('siteName');
  const title = settings['meta_title_ar'] || t('defaultTitle');
  const description = settings['meta_description_ar'] || t('defaultDescription');
  const ogImage = settings['og_image'] || undefined;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.startsWith('http')
    ? process.env.NEXT_PUBLIC_SITE_URL
    : 'http://localhost:3000';

  return {
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    metadataBase: new URL(siteUrl),
    openGraph: ogImage ? { images: [{ url: ogImage }] } : undefined,
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'ar')) {
    notFound();
  }

  const messages = await getMessages();
  const isRTL = locale === 'ar';

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={isRTL ? 'font-cairo' : 'font-sora'} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
            <Toaster
              position={isRTL ? 'bottom-right' : 'bottom-left'}
              richColors
            />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
