import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number | string,
  options: {
    currency?: 'UZS' | 'USD';
    notation?: Intl.NumberFormatOptions['notation'];
  } = {}
) {
  const { currency = 'UZS', notation = 'standard' } = options;
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numericPrice)) return '0 UZS';

  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency,
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
