import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import type {
  SavedCard,
  AddCardPayload,
  AddCardResponse,
  VerifyCardPayload,
  VerifyCardResponse,
  InitializePaymentPayload,
  InitializePaymentResponse,
  PayWithCardPayload,
  PayWithCardResponse,
  PaymentItem,
  CancelPaymentPayload,
} from '@/types/payments';
import type { PaginatedResponse } from '@/types';
import axios from 'axios';

export function parsePaymentError(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as Record<string, unknown>;

    if (typeof data.detail === 'string') {
      return data.detail;
    }
    if (typeof data.message === 'string') {
      return data.message;
    }
    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
      return String(data.non_field_errors[0]);
    }

    const fieldErrors: string[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value) && value.length > 0) {
        fieldErrors.push(`${key}: ${value[0]}`);
      } else if (typeof value === 'string') {
        fieldErrors.push(`${key}: ${value}`);
      }
    }
    if (fieldErrors.length > 0) {
      return fieldErrors.join(', ');
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'To‘lov amalini bajarishda kutilmagan xatolik yuz berdi.';
}

export const paymentsApi = {
  /**
   * Foydalanuvchining saqlangan bank kartalarini olish
   */
  async getSavedCards(): Promise<SavedCard[]> {
    const res = await apiClient.get<SavedCard[] | PaginatedResponse<SavedCard>>(
      API_ENDPOINTS.PAYMENTS.CARDS.LIST
    );
    if (Array.isArray(res.data)) {
      return res.data;
    }
    if (res.data && Array.isArray((res.data as PaginatedResponse<SavedCard>).results)) {
      return (res.data as PaginatedResponse<SavedCard>).results;
    }
    return [];
  },

  /**
   * Yangi bank kartasini ro'yxatdan o'tkazish (SMS OTP yuboriladi)
   */
  async addSavedCard(payload: AddCardPayload): Promise<AddCardResponse> {
    const res = await apiClient.post<AddCardResponse>(
      API_ENDPOINTS.PAYMENTS.CARDS.ADD,
      payload
    );
    return res.data;
  },

  /**
   * SMS OTP kodini kiritib kartani tasdiqlash va faollashtirish
   */
  async verifySavedCard(payload: VerifyCardPayload): Promise<VerifyCardResponse> {
    const res = await apiClient.post<VerifyCardResponse>(
      API_ENDPOINTS.PAYMENTS.CARDS.VERIFY(payload.card_id),
      { otp_code: payload.otp_code }
    );
    return res.data;
  },

  /**
   * Kartani asosiy (default) to'lov usuli qilib belgilash
   */
  async setDefaultCard(cardId: number): Promise<{ success: boolean; message?: string }> {
    const res = await apiClient.post<{ success: boolean; message?: string }>(
      API_ENDPOINTS.PAYMENTS.CARDS.SET_DEFAULT(cardId)
    );
    return res.data;
  },

  /**
   * Saqlangan kartani o'chirish
   */
  async deleteSavedCard(cardId: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PAYMENTS.CARDS.DELETE(cardId));
  },

  /**
   * Payme yoki Click orqali to'lovni boshlash (gateway checkout link oladi)
   */
  async initializePayment(
    payload: InitializePaymentPayload
  ): Promise<InitializePaymentResponse> {
    const res = await apiClient.post<InitializePaymentResponse>(
      API_ENDPOINTS.PAYMENTS.INITIALIZE,
      payload
    );
    return res.data;
  },

  /**
   * Saqlangan karta orqali 1-bosishda (1-Click) to'lov qilish
   */
  async payWithCard(payload: PayWithCardPayload): Promise<PayWithCardResponse> {
    const res = await apiClient.post<PayWithCardResponse>(
      API_ENDPOINTS.PAYMENTS.PAY_WITH_CARD,
      payload
    );
    return res.data;
  },

  /**
   * Foydalanuvchining to'lovlar tarixini olish
   */
  async getPayments(params?: {
    page?: number;
  }): Promise<PaginatedResponse<PaymentItem>> {
    const res = await apiClient.get<PaginatedResponse<PaymentItem>>(
      API_ENDPOINTS.PAYMENTS.LIST,
      { params }
    );
    return res.data;
  },

  /**
   * Bitta to'lov tafsilotini olish
   */
  async getPaymentDetail(paymentNumber: string): Promise<PaymentItem> {
    const res = await apiClient.get<PaymentItem>(
      API_ENDPOINTS.PAYMENTS.DETAIL(paymentNumber)
    );
    return res.data;
  },

  /**
   * Kutilayotgan to'lovni bekor qilish
   */
  async cancelPayment(payload: CancelPaymentPayload): Promise<PaymentItem> {
    const res = await apiClient.post<PaymentItem>(
      API_ENDPOINTS.PAYMENTS.CANCEL(payload.payment_number),
      { reason: payload.reason || 'Mijoz tomonidan bekor qilindi' }
    );
    return res.data;
  },
};
