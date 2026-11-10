import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number | string,
  options: {
    currency?: 'USD' | 'UZS';
    notation?: Intl.NumberFormatOptions['notation'];
  } = {}
) {
  const { currency = 'USD', notation = 'standard' } = options;
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numericPrice)) return currency === 'USD' ? '$0' : '0 so\'m';

  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation,
      maximumFractionDigits: numericPrice % 1 === 0 ? 0 : 2,
    }).format(numericPrice);
  }

  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    notation,
    maximumFractionDigits: 0,
  }).format(numericPrice);
}

export function formatDate(date: string | Date | number): string {
  if (!date) return '';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('uz-UZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Rasmlar URL manzilini normallashtirish:
 * - http://127.0.0.1:8000/media/... yoki http://localhost:8000/media/... manzillarini
 *   Next.js rewrite orqali nisbiy /media/... ga o'giradi (CORS, turli IP va dev-proxy uchun xavfsiz).
 * - Nisbiy media/... bo'lsa, oldiga slash qo'shadi.
 */
export function normalizeImageUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('/media/')) return url;
  if (url.startsWith('media/')) return `/${url}`;
  // http://...:8000/media/... yoki boshqa har qanday host/IP dan kelgan media yo'lini nisbiy /media/... ga o'giradi
  if (/^https?:\/\/[^/]+\/media\//.test(url)) {
    return url.replace(/^https?:\/\/[^/]+(\/media\/.*)/, '$1');
  }
  return url;
}
