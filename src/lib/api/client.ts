import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getOrCreateGuestSessionKey } from '@/lib/storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Token va Mehmon Sessiyasi kalitini uzatish
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      // Mehmon foydalanuvchilar savatchasi uchun X-Session-Key
      const guestKey = getOrCreateGuestSessionKey();
      if (guestKey) {
        config.headers.set('X-Session-Key', guestKey);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 Unauthorized holatida tokenni avtomatik yangilash (Refresh Queue)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 401 Unauthorized va so'rov hali qayta urinilmagan bo'lsa
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Agar refresh token so'rovining o'zi 401 qaytarsa, to'xtatamiz
      if (originalRequest.url?.includes('/api/v1/auth/token/refresh/')) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      // Agar ayni vaqtda boshqa so'rov tokenni yangilayotgan bo'lsa, navbatga qo'shamiz
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().logout();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = data.access;
        useAuthStore.getState().setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
