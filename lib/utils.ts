import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = '₪'): string {
  return `${currency}${amount.toLocaleString('ar-SA')}`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString('ar-SA');
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\u0621-\u064A\u0660-\u0669\w\-]+/g, '') // Remove all non-word chars (except - and Arabic)
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function getLocalized(obj: any, field: string, locale: string): string {
  if (!obj) return '';
  const currentLocaleSuffix = locale === 'ar' ? 'Ar' : 'En';
  const current = obj[`${field}${currentLocaleSuffix}`];
  if (current && String(current).trim() !== '') return current;

  const fallbackLocaleSuffix = locale === 'ar' ? 'En' : 'Ar';
  return obj[`${field}${fallbackLocaleSuffix}`] || '';
}
