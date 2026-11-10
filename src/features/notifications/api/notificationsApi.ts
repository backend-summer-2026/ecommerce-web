import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import type {
  NotificationItem,
  NotificationDetail,
  NotificationUnreadCount,
  NotificationPreference,
  NotificationPreferenceUpdatePayload,
  NotificationFilterParams,
  PaginatedNotificationsResponse,
  MarkAllReadResponse,
  ClearReadResponse,
} from '@/types/notifications';
import axios from 'axios';

export function parseNotificationError(error: unknown): string {
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

  return 'Xabarnomalar bilan bog‘liq amalda kutilmagan xatolik yuz berdi.';
}

export const notificationsApi = {
  /**
   * Foydalanuvchi xabarnomalari ro'yxatini olish (filtrlar va sahifalash bilan)
   */
  async getNotifications(params?: NotificationFilterParams): Promise<PaginatedNotificationsResponse> {
    const queryParams: Record<string, unknown> = {};

    if (params) {
      if (params.is_read !== undefined) {
        queryParams.is_read = params.is_read;
      }
      if (params.type) {
        queryParams.type = params.type;
      }
      if (params.priority) {
        queryParams.priority = params.priority;
      }
      if (params.q) {
        queryParams.q = params.q;
      }
      if (params.page) {
        queryParams.page = params.page;
      }
      if (params.page_size) {
        queryParams.page_size = params.page_size;
      }
    }

    const res = await apiClient.get<PaginatedNotificationsResponse>(
      API_ENDPOINTS.NOTIFICATIONS.LIST,
      { params: queryParams }
    );
    return res.data;
  },

  /**
   * O'qilmagan va shoshilinch xabarnomalar soni
   */
  async getUnreadCount(): Promise<NotificationUnreadCount> {
    const res = await apiClient.get<NotificationUnreadCount>(
      API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    );
    return res.data;
  },

  /**
   * Bitta xabarnoma batafsil ma'lumotini olish
   */
  async getNotificationDetail(id: number | string): Promise<NotificationDetail> {
    const res = await apiClient.get<NotificationDetail>(
      API_ENDPOINTS.NOTIFICATIONS.DETAIL(id)
    );
    return res.data;
  },

  /**
   * Xabarnomani o'qilgan deb belgilash
   */
  async markAsRead(id: number | string): Promise<NotificationDetail> {
    const res = await apiClient.post<NotificationDetail>(
      API_ENDPOINTS.NOTIFICATIONS.READ(id)
    );
    return res.data;
  },

  /**
   * Xabarnomani o'qilmagan holatiga qaytarish
   */
  async markAsUnread(id: number | string): Promise<NotificationDetail> {
    const res = await apiClient.post<NotificationDetail>(
      API_ENDPOINTS.NOTIFICATIONS.UNREAD(id)
    );
    return res.data;
  },

  /**
   * Barcha o'qilmagan xabarnomalarni birdaniga o'qilgan deb belgilash
   */
  async markAllAsRead(): Promise<MarkAllReadResponse> {
    const res = await apiClient.post<MarkAllReadResponse>(
      API_ENDPOINTS.NOTIFICATIONS.READ_ALL
    );
    return res.data;
  },

  /**
   * Bitta xabarnomani o'chirish
   */
  async deleteNotification(id: number | string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
  },

  /**
   * Barcha o'qilgan xabarnomalarni tozalash (o'chirish)
   */
  async clearReadNotifications(): Promise<ClearReadResponse> {
    const res = await apiClient.delete<ClearReadResponse>(
      API_ENDPOINTS.NOTIFICATIONS.CLEAR_READ
    );
    return res.data;
  },

  /**
   * Foydalanuvchi xabarnoma sozlamalarini (preferences) olish
   */
  async getPreferences(): Promise<NotificationPreference> {
    const res = await apiClient.get<NotificationPreference>(
      API_ENDPOINTS.NOTIFICATIONS.PREFERENCES
    );
    return res.data;
  },

  /**
   * Xabarnoma sozlamalarini yangilash
   */
  async updatePreferences(
    payload: NotificationPreferenceUpdatePayload
  ): Promise<NotificationPreference> {
    const res = await apiClient.patch<NotificationPreference>(
      API_ENDPOINTS.NOTIFICATIONS.PREFERENCES,
      payload
    );
    return res.data;
  },
};
