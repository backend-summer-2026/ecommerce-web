import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import type {
  Cart,
  CartSummary,
  AddToCartPayload,
  UpdateCartItemPayload,
  MergeCartPayload,
} from '@/types/cart';
import axios from 'axios';

export function parseCartError(error: unknown): string {
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

  return 'Savatcha amalini bajarishda kutilmagan xatolik yuz berdi.';
}

export const cartApi = {
  /**
   * Foydalanuvchi yoki mehmonning to'liq faol savatchasini olish
   */
  async getCart(): Promise<Cart> {
    const { data } = await apiClient.get<Cart>(API_ENDPOINTS.CART.GET_CART);
    return data;
  },

  /**
   * Navbar badge uchun qisqa xulosa (elementlar soni va umumiy summa)
   */
  async getCartCount(): Promise<CartSummary> {
    const { data } = await apiClient.get<CartSummary>(API_ENDPOINTS.CART.COUNT);
    return data;
  },

  /**
   * Mahsulot variantini (SKU) savatchaga qo'shish
   */
  async addItem(payload: AddToCartPayload): Promise<Cart> {
    const { data } = await apiClient.post<Cart>(API_ENDPOINTS.CART.ADD_ITEM, payload);
    return data;
  },

  /**
   * Savatchadagi element miqdorini yangilash
   */
  async updateQuantity(itemId: number, payload: UpdateCartItemPayload): Promise<Cart> {
    const { data } = await apiClient.patch<Cart>(API_ENDPOINTS.CART.UPDATE_ITEM(itemId), payload);
    return data;
  },

  /**
   * Elementni savatchadan butunlay o'chirish
   */
  async removeItem(itemId: number): Promise<Cart> {
    const { data } = await apiClient.delete<Cart>(API_ENDPOINTS.CART.REMOVE_ITEM(itemId));
    return data;
  },

  /**
   * Savatchani to'liq tozalash
   */
  async clearCart(): Promise<Cart> {
    const { data } = await apiClient.post<Cart>(API_ENDPOINTS.CART.CLEAR);
    return data;
  },

  /**
   * Mehmon sessiya savatchasini kirgan mijoz hisobiga birlashtirish
   */
  async mergeCart(payload: MergeCartPayload): Promise<Cart> {
    const { data } = await apiClient.post<Cart>(API_ENDPOINTS.CART.MERGE, payload);
    return data;
  },
};
