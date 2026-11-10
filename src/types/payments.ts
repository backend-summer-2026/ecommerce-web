import type { PaymentStatus } from './orders';

export type { PaymentStatus };

export type PaymentProvider = 'PAYME' | 'CLICK' | 'UZUM';

export type CardProvider = 'PAYME' | 'CLICK' | 'UZUM';

export type CardBrand = 'UZCARD' | 'HUMO' | 'VISA' | 'MASTERCARD' | 'UNKNOWN';

export interface SavedCard {
  id: number;
  card_number: string; // e.g. "860012******9012" or "8600 •••• •••• 9012"
  expire_month: string;
  expire_year: string;
  card_holder: string;
  provider: CardProvider;
  brand?: CardBrand;
  is_default: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface AddCardPayload {
  card_number: string;
  expire_month: string;
  expire_year: string;
  card_holder: string;
  provider: CardProvider;
}

export interface AddCardResponse {
  id: number;
  card_number: string;
  provider: CardProvider;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | string;
  message?: string;
  phone_masked?: string;
}

export interface VerifyCardPayload {
  card_id: number;
  otp_code: string;
}

export interface VerifyCardResponse {
  id: number;
  card_number: string;
  is_verified: boolean;
  is_default: boolean;
  message?: string;
}

export interface InitializePaymentPayload {
  order_number: string;
  provider: PaymentProvider;
  return_url: string;
}

export interface InitializePaymentResponse {
  payment_number: string;
  order_number: string;
  amount: string | number;
  provider: PaymentProvider;
  status: PaymentStatus;
  payment_url?: string;
  checkout_url?: string;
  qr_code_url?: string | null;
  created_at?: string;
}

export interface PayWithCardPayload {
  order_number: string;
  card_id: number;
}

export interface PayWithCardResponse {
  payment_number: string;
  order_number: string;
  amount: string | number;
  status: PaymentStatus;
  message?: string;
  created_at?: string;
}

export interface PaymentItem {
  id?: number;
  payment_number: string;
  order_number: string;
  amount: string | number;
  provider: PaymentProvider | string;
  status: PaymentStatus;
  card?: Partial<SavedCard> | null;
  payment_url?: string | null;
  checkout_url?: string | null;
  paid_at?: string | null;
  cancel_reason?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CancelPaymentPayload {
  payment_number: string;
  reason?: string;
}
