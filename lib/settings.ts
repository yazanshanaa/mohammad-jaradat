import { prisma } from '@/lib/prisma';

const DEFAULTS: Record<string, string> = {
  // معلومات التواصل
  phone: '+970591234567',
  whatsapp: '970591234567',
  email: 'info@afaq.ps',
  address_ar: 'فلسطين',
  address_en: 'Palestine',
  working_hours_ar: 'الأحد - الخميس: 8:00 - 17:00',
  working_hours_en: 'Sun - Thu: 8:00 AM - 5:00 PM',
  maps_embed_url: '',
  // شبكات التواصل
  facebook: '',
  instagram: '',
  tiktok: '',
  youtube: '',
  linkedin: '',
  location_url: '',
  // اسم الموقع
  site_name_ar: 'افاق',
  site_name_en: 'AFAQ',
  // إعدادات الصفحة الرئيسية
  hero_title_ar: 'طاقة شمسية لمستقبل أفضل',
  hero_subtitle_ar: 'نصمم ونركب أنظمة الطاقة الشمسية المتكاملة لمنزلك وعملك بأعلى جودة وأفضل أسعار في فلسطين',
  hero_cta_ar: 'احصل على عرض مجاني',
  tagline_ar: 'طاقة نظيفة لمستقبل أفضل',
  stats_projects: '500',
  stats_clients: '400',
  stats_mw: '5',
  // إظهار الأقسام
  section_services_visible: 'true',
  section_projects_visible: 'true',
  // إعدادات SEO
  meta_title_ar: 'افاق | خبراء الطاقة الشمسية في فلسطين',
  meta_description_ar: 'نوفر أفضل حلول الطاقة الشمسية لمنزلك وعملك. تركيب احترافي، ضمان 25 سنة، أسعار تنافسية.',
  keywords_ar: 'طاقة شمسية، الواح شمسية، فلسطين، افاق',
  og_image: '',
  // إعدادات المتجر
  store_enabled: 'true',
  store_show_price: 'true',
  store_whatsapp: '',
  store_currency: 'ILS',
  store_name_ar: 'المتجر',
  store_free_shipping_note: '',
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
