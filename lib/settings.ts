import { prisma } from '@/lib/prisma';

const DEFAULTS: Record<string, string> = {
  phone: '+970591234567',
  whatsapp: '970591234567',
  email: 'info@afaq.ps',
  address_ar: 'فلسطين',
  address_en: 'Palestine',
  working_hours_ar: 'الأحد - الخميس: 8:00 - 17:00',
  working_hours_en: 'Sun - Thu: 8:00 AM - 5:00 PM',
  facebook: '',
  instagram: '',
  tiktok: '',
  youtube: '',
  linkedin: '',
  location_url: '',
  site_name_ar: 'افاق',
  site_name_en: 'AFAQ',
  section_services_visible: 'true',
  section_projects_visible: 'true',
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
