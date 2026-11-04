import type { OrderStatus, PaymentStatus, PaymentMethod, ShippingMethod } from '@/types/orders';

export const ORDER_STATUS_MAP: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  PENDING: {
    label: 'Kutilmoqda',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  AWAITING_PAYMENT: {
    label: 'To‘lov kutilmoqda',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  CONFIRMED: {
    label: 'Tasdiqlangan',
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  PROCESSING: {
    label: 'Yig‘ilmoqda',
    color: 'text-indigo-700 dark:text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  SHIPPED: {
    label: 'Yetkazilmoqda',
    color: 'text-purple-700 dark:text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  DELIVERED: {
    label: 'Yetkazib berildi',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  CANCELLED: {
    label: 'Bekor qilingan',
    color: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  REFUNDED: {
    label: 'Mablag‘ qaytarildi',
    color: 'text-slate-700 dark:text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
  },
};

export const PAYMENT_STATUS_MAP: Record<
  PaymentStatus,
  { label: string; color: string; bg: string }
> = {
  PENDING: { label: 'To‘lanmagan', color: 'text-amber-600', bg: 'bg-amber-50' },
  PAID: { label: 'To‘langan', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  PARTIALLY_REFUNDED: { label: 'Qisman qaytarilgan', color: 'text-orange-600', bg: 'bg-orange-50' },
  REFUNDED: { label: 'Qaytarilgan', color: 'text-slate-600', bg: 'bg-slate-50' },
  FAILED: { label: 'Muvaffaqiyatsiz', color: 'text-rose-600', bg: 'bg-rose-50' },
};

export const PAYMENT_METHOD_MAP: Record<PaymentMethod, string> = {
  PAYME: 'Payme',
  CLICK: 'Click',
  UZUM: 'Uzum Bank',
  CASH_ON_DELIVERY: 'Qabul qilganda naqd',
  CARD_ON_DELIVERY: 'Qabul qilganda karta orqali',
};

export const SHIPPING_METHOD_MAP: Record<ShippingMethod, { label: string; desc: string }> = {
  STANDARD: {
    label: 'Standart yetkazib berish',
    desc: 'O‘zbekiston bo‘ylab 1-3 ish kunida yetkaziladi',
  },
  EXPRESS: {
    label: 'Tezkor Express kuryer',
    desc: 'Buyurtma berilgan kundan 24 soat ichida',
  },
  PICKUP: {
    label: 'Olib ketish punkti',
    desc: 'Eng yaqin do‘konimizdan bepul olib ketish',
  },
};

export const UZBEKISTAN_REGIONS = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Samarqand viloyati',
  'Farg‘ona viloyati',
  'Andijon viloyati',
  'Namangan viloyati',
  'Buxoro viloyati',
  'Qashqadaryo viloyati',
  'Surxondaryo viloyati',
  'Xorazm viloyati',
  'Navoiy viloyati',
  'Jizzax viloyati',
  'Sirdaryo viloyati',
  'Qoraqalpog‘iston Respublikasi',
];
