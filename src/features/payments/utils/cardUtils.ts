import type { CardBrand, PaymentStatus, PaymentProvider } from '@/types/payments';

/**
 * Karta raqamining dastlabki raqamlariga ko'ra uning turini (brand) aniqlash
 */
export function detectCardBrand(cardNumber: string): CardBrand {
  const clean = cardNumber.replace(/\D/g, '');
  if (!clean) return 'UNKNOWN';

  if (clean.startsWith('8600') || clean.startsWith('5614')) {
    return 'UZCARD';
  }
  if (clean.startsWith('9860')) {
    return 'HUMO';
  }
  if (clean.startsWith('4')) {
    return 'VISA';
  }
  if (/^(5[1-5]|2[2-7])/.test(clean)) {
    return 'MASTERCARD';
  }
  return 'UNKNOWN';
}

/**
 * Karta raqamini probellar bilan formatlash: 8600 1234 5678 9012
 */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(' ') : digits;
}

/**
 * Amal qilish muddatini formatlash: MM/YY
 */
export function formatCardExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  }
  return digits;
}

/**
 * Karta raqamini xavfsiz ko'rinishda maskalash
 */
export function maskCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length === 16) {
    return `${digits.slice(0, 4)} •••• •••• ${digits.slice(12)}`;
  }
  if (cardNumber.includes('*')) {
    return cardNumber;
  }
  if (digits.length > 4) {
    return `•••• ${digits.slice(-4)}`;
  }
  return cardNumber;
}

/**
 * Karta brendiga ko'ra vizual gradient va fon sozlamalari
 */
export function getCardBrandTheme(brand?: CardBrand) {
  switch (brand) {
    case 'UZCARD':
      return {
        bg: 'bg-gradient-to-tr from-sky-900 via-blue-800 to-indigo-900 text-white',
        border: 'border-blue-600/30',
        badgeBg: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
        brandName: 'UZCARD',
        accent: 'from-blue-400 to-cyan-300',
      };
    case 'HUMO':
      return {
        bg: 'bg-gradient-to-tr from-amber-900 via-orange-800 to-amber-700 text-white',
        border: 'border-orange-500/30',
        badgeBg: 'bg-orange-500/20 text-orange-200 border-orange-400/30',
        brandName: 'HUMO',
        accent: 'from-orange-400 to-amber-300',
      };
    case 'VISA':
      return {
        bg: 'bg-gradient-to-tr from-blue-950 via-slate-900 to-blue-900 text-white',
        border: 'border-yellow-500/30',
        badgeBg: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30',
        brandName: 'VISA',
        accent: 'from-yellow-400 to-amber-300',
      };
    case 'MASTERCARD':
      return {
        bg: 'bg-gradient-to-tr from-stone-900 via-neutral-800 to-red-950 text-white',
        border: 'border-red-500/30',
        badgeBg: 'bg-red-500/20 text-red-200 border-red-400/30',
        brandName: 'Mastercard',
        accent: 'from-red-400 to-orange-400',
      };
    default:
      return {
        bg: 'bg-gradient-to-tr from-slate-900 via-neutral-900 to-slate-800 text-white',
        border: 'border-slate-700/50',
        badgeBg: 'bg-slate-700/40 text-slate-200 border-slate-600/30',
        brandName: 'Bank Card',
        accent: 'from-emerald-400 to-teal-300',
      };
  }
}

/**
 * To'lov statuslari uchun vizual parametrlar
 */
export const PAYMENT_STATUS_DETAILS: Record<
  PaymentStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  PAID: {
    label: 'To‘langan',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  PENDING: {
    label: 'Kutilmoqda',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
  },
  FAILED: {
    label: 'Xatolik / To‘lanmadi',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
  },
  CANCELLED: {
    label: 'Bekor qilingan',
    color: 'text-muted-foreground',
    bg: 'bg-muted/60',
    border: 'border-border',
  },
  REFUNDED: {
    label: 'Qaytarilgan (Refunded)',
    color: 'text-purple-700 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800',
  },
  PARTIALLY_REFUNDED: {
    label: 'Qisman qaytarilgan',
    color: 'text-indigo-700 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
};

/**
 * To'lov tizimlari nomi va ikonkalari
 */
export const PAYMENT_PROVIDER_DETAILS: Record<
  PaymentProvider,
  { name: string; desc: string; badgeColor: string }
> = {
  PAYME: {
    name: 'Payme',
    desc: 'Payme ilovasi yoki veb sahifasi orqali to‘lov',
    badgeColor: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-800',
  },
  CLICK: {
    name: 'Click',
    desc: 'Click Up ilovasi yoki veb sahifasi orqali to‘lov',
    badgeColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800',
  },
  UZUM: {
    name: 'Uzum Bank',
    desc: 'Uzum Bank ilovasi orqali tezkor to‘lov',
    badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800',
  },
};
