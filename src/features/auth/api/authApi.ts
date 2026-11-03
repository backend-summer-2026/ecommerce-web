import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import type {
  User,
  LoginCredentials,
  RegisterData,
  SendOtpData,
  VerifyOtpData,
  AuthResponse,
  ProfileUpdateData,
} from '@/types/auth';
import axios from 'axios';

export function parseApiError(error: unknown): string {
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

    // Har bir maydon bo'yicha xatoliklarni tekshirish
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

  return 'Kutilmagan xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.';
}

export const authApi = {
  /**
   * Foydalanuvchi hisobiga kirish (JWT)
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return data;
  },

  /**
   * Yangi mijoz hisobini ro'yxatdan o'tkazish (OTP emailingizga yuboriladi)
   */
  async register(registerData: RegisterData): Promise<{ message: string; email: string }> {
    const { data } = await apiClient.post<{ message: string; email: string }>(
      API_ENDPOINTS.AUTH.REGISTER,
      registerData
    );
    return data;
  },

  /**
   * Bir martalik OTP kod yuborish / qayta yuborish
   */
  async sendOtp(otpData: SendOtpData): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.AUTH.SEND_OTP,
      otpData
    );
    return data;
  },

  /**
   * OTP kodni tasdiqlash va JWT tokenlarni qabul qilish
   */
  async verifyOtp(verifyData: VerifyOtpData): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      verifyData
    );
    return data;
  },

  /**
   * Hozirgi kirgan foydalanuvchi profilini olish
   */
  async getProfile(): Promise<User> {
    const { data } = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    return data;
  },

  /**
   * Profil ma'lumotlarini tahrirlash
   */
  async updateProfile(profileData: ProfileUpdateData): Promise<User> {
    const { data } = await apiClient.patch<User>(API_ENDPOINTS.AUTH.ME, profileData);
    return data;
  },

  /**
   * Access tokenni yangilash
   */
  async refreshToken(refresh: string): Promise<{ access: string }> {
    const { data } = await apiClient.post<{ access: string }>(API_ENDPOINTS.AUTH.REFRESH, {
      refresh,
    });
    return data;
  },

  /**
   * Mehmon savatchasini faol foydalanuvchi hisobiga birlashtirish
   */
  async mergeCart(guestSessionKey: string): Promise<unknown> {
    try {
      const { data } = await apiClient.post(API_ENDPOINTS.CART.MERGE, {
        guest_session_key: guestSessionKey,
        guest_cart_id: null,
      });
      return data;
    } catch (err) {
      // Agar savat bo'sh bo'lsa yoki birlashtirishda xatolik bo'lsa, auth jarayonini to'xtatmaymiz
      console.warn('Cart merge failed or unnecessary:', err);
      return null;
    }
  },
};
