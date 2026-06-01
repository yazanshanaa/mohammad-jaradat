import type { Metadata } from 'next';
import { getSettings } from '@/lib/settings';
import { redirect } from 'next/navigation';
import { CheckoutForm } from '@/components/store/CheckoutForm';

export const metadata: Metadata = {
  title: 'إتمام الطلب',
};

export default async function CheckoutPage() {
  const settings = await getSettings();
  if (settings['store_enabled'] === 'false') redirect('/');

  const showPriceGlobal = settings['store_show_price'] !== 'false';
  const storeWhatsapp = settings['store_whatsapp'] || settings['whatsapp'] || '';

  return <CheckoutForm showPriceGlobal={showPriceGlobal} storeWhatsapp={storeWhatsapp} />;
}
