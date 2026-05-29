import { prisma } from '@/lib/prisma';

const DEFAULTS: Record<string, string> = {
  phone: '+970591234567',
  whatsapp: '970591234567',
  email: 'info@solarpro.ps',
  address_ar: 'رام الله، فلسطين',
  address_en: 'Ramallah, Palestine',
  working_hours_ar: 'الأحد - الخميس: 8:00 - 17:00',
  working_hours_en: 'Sun - Thu: 8:00 AM - 5:00 PM',
  facebook: 'https://facebook.com/solarpro.ps',
  instagram: 'https://instagram.com/solarpro.ps',
  youtube: 'https://youtube.com/@solarpro',
  linkedin: '',
  site_name_ar: 'سولار برو',
  site_name_en: 'SolarPro',
};

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.setting.findMany();
    const map: Record<string, string> = { ...DEFAULTS };
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  } catch {
    return { ...DEFAULTS };
  }
}
