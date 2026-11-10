import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import type {
  CheckoutPreviewInput,
  CheckoutPreviewResponse,
  CouponValidationResponse,
  OrderCreatePayload,
  OrderDetail,
  OrderListItem,
  OrderTrackingResponse,
  OrderInvoice,
} from '@/types/orders';
import type { PaginatedResponse } from '@/types';
import axios from 'axios';

export function parseOrderError(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as Record<string, unknown>;

    if (typeof data.detail === 'string') {
      return data.detail;
    }
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      return String(data.detail[0]);
    }
    if (typeof data.message === 'string') {
      return data.message;
    }
    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
      return String(data.non_field_errors[0]);
    }

    const fieldErrors: string[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Nested object (e.g., shipping_address errors)
        for (const [subKey, subVal] of Object.entries(value)) {
          if (Array.isArray(subVal) && subVal.length > 0) {
            fieldErrors.push(`${subKey}: ${subVal[0]}`);
          }
        }
      } else if (Array.isArray(value) && value.length > 0) {
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

  return 'Buyurtma amalini bajarishda kutilmagan xatolik yuz berdi.';
}

export const ordersApi = {
  /**
   * Checkout jarayonidagi hisob-kitob predprosmotri
   */
  async previewCheckout(payload: CheckoutPreviewInput = {}): Promise<CheckoutPreviewResponse> {
    const { data } = await apiClient.post<CheckoutPreviewResponse>(
      API_ENDPOINTS.ORDERS.PREVIEW,
      payload
    );
    return data;
  },

  /**
   * Kupon / promokodni tekshirish va chegirma miqdorini hisoblash
   */
  async validateCoupon(code: string, subtotal: string = '0.00'): Promise<CouponValidationResponse> {
    const { data } = await apiClient.post<CouponValidationResponse>(
      API_ENDPOINTS.ORDERS.VALIDATE_COUPON,
      { code, subtotal }
    );
    return data;
  },

  /**
   * Yangi buyurtma yaratish
   */
  async createOrder(payload: OrderCreatePayload): Promise<OrderDetail> {
    const { data } = await apiClient.post<OrderDetail>(API_ENDPOINTS.ORDERS.CREATE, payload);
    return data;
  },

  /**
   * Mijozning buyurtmalari ro'yxati (sahifalash va status filtri bilan)
   */
  async getOrders(params?: {
    status?: string;
    page?: number;
  }): Promise<PaginatedResponse<OrderListItem>> {
    const { data } = await apiClient.get<PaginatedResponse<OrderListItem>>(
      API_ENDPOINTS.ORDERS.LIST,
      { params }
    );
    return data;
  },

  /**
   * Muayyan buyurtmaning to'liq tafsilotlari
   */
  async getOrderDetail(orderNumber: string): Promise<OrderDetail> {
    const { data } = await apiClient.get<OrderDetail>(API_ENDPOINTS.ORDERS.DETAIL(orderNumber));
    return data;
  },

  /**
   * Buyurtmani bekor qilish
   */
  async cancelOrder(orderNumber: string, reason?: string): Promise<OrderDetail> {
    const { data } = await apiClient.post<OrderDetail>(
      API_ENDPOINTS.ORDERS.CANCEL(orderNumber),
      { reason: reason || 'Mijoz tomonidan bekor qilindi.' }
    );
    return data;
  },

  /**
   * Buyurtma harakati va bosqichlari (Tracking timeline)
   */
  async getOrderTracking(orderNumber: string): Promise<OrderTrackingResponse> {
    const { data } = await apiClient.get<OrderTrackingResponse>(
      API_ENDPOINTS.ORDERS.TRACKING(orderNumber)
    );
    return data;
  },

  /**
   * Buyurtmaning rasmiy elektron cheki (Invoice)
   */
  async getOrderInvoice(orderNumber: string): Promise<OrderInvoice> {
    const { data } = await apiClient.get<OrderInvoice>(
      API_ENDPOINTS.ORDERS.INVOICE(orderNumber)
    );
    return data;
  },
};
