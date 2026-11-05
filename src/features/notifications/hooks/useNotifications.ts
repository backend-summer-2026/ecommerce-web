import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, parseNotificationError } from '@/features/notifications/api/notificationsApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import type {
  NotificationFilterParams,
  PaginatedNotificationsResponse,
  NotificationDetail,
  NotificationUnreadCount,
  NotificationPreference,
  NotificationPreferenceUpdatePayload,
} from '@/types/notifications';
import { toast } from 'sonner';

export const notificationKeys = {
  all: ['notifications'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params?: NotificationFilterParams) =>
    [...notificationKeys.lists(), params] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: number | string) =>
    [...notificationKeys.details(), String(id)] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
};

/**
 * O'qilmagan xabarnomalar soni hooki (Navbar badge va popover uchun)
 * Avtomatik tarzda har 60 soniyada yangilab turadi.
 */
export function useNotificationUnreadCount(options?: { enabled?: boolean }) {
  const { isAuthenticated } = useAuthStore();
  const isEnabled = (options?.enabled ?? true) && isAuthenticated;

  return useQuery<NotificationUnreadCount>({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled: isEnabled,
    staleTime: 20 * 1000,
    refetchInterval: isEnabled ? 45 * 1000 : false,
    refetchOnWindowFocus: true,
  });
}

/**
 * Xabarnomalar ro'yxati hooki (filtrlar va sahifalash bilan)
 */
export function useNotifications(
  params?: NotificationFilterParams,
  options?: { enabled?: boolean }
) {
  const { isAuthenticated } = useAuthStore();
  const isEnabled = (options?.enabled ?? true) && isAuthenticated;

  return useQuery<PaginatedNotificationsResponse>({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.getNotifications(params),
    enabled: isEnabled,
    staleTime: 15 * 1000,
  });
}

/**
 * Bitta xabarnoma tafsilotlari hooki
 */
export function useNotificationDetail(id: number | string | undefined) {
  const { isAuthenticated } = useAuthStore();

  return useQuery<NotificationDetail>({
    queryKey: notificationKeys.detail(id || 0),
    queryFn: () => notificationsApi.getNotificationDetail(id!),
    enabled: Boolean(id) && isAuthenticated,
    staleTime: 60 * 1000,
  });
}

/**
 * Xabarnomani o'qilgan deb belgilash
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => notificationsApi.markAsRead(id),
    onSuccess: (data, id) => {
      // Unread count keshini kamaytirish
      queryClient.setQueryData<NotificationUnreadCount>(
        notificationKeys.unreadCount(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            unread_count: Math.max(0, old.unread_count - 1),
          };
        }
      );

      // Ro'yxatdagi holatni yangilash
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.setQueryData(notificationKeys.detail(id), data);
    },
    onError: (err) => {
      toast.error(parseNotificationError(err));
    },
  });
}

/**
 * Xabarnomani o'qilmagan deb belgilash
 */
export function useMarkNotificationUnread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => notificationsApi.markAsUnread(id),
    onSuccess: (data, id) => {
      // Unread count keshini oshirish
      queryClient.setQueryData<NotificationUnreadCount>(
        notificationKeys.unreadCount(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            unread_count: old.unread_count + 1,
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.setQueryData(notificationKeys.detail(id), data);
    },
    onError: (err) => {
      toast.error(parseNotificationError(err));
    },
  });
}

/**
 * Barcha xabarnomalarni o'qilgan deb belgilash
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: (res) => {
      // Unread countni 0 ga tushirish
      queryClient.setQueryData<NotificationUnreadCount>(
        notificationKeys.unreadCount(),
        (old) => ({
          unread_count: 0,
          urgent_count: 0,
        })
      );

      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      toast.success(res.message || 'Barcha xabarnomalar o‘qilgan deb belgilandi.');
    },
    onError: (err) => {
      toast.error(parseNotificationError(err));
    },
  });
}

/**
 * Bitta xabarnomani o'chirish
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      toast.success('Xabarnoma o‘chirildi.');
    },
    onError: (err) => {
      toast.error(parseNotificationError(err));
    },
  });
}

/**
 * Barcha o'qilgan xabarnomalarni tozalash
 */
export function useClearReadNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.clearReadNotifications(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      toast.success(res.message || 'O‘qilgan xabarnomalar tozalandi.');
    },
    onError: (err) => {
      toast.error(parseNotificationError(err));
    },
  });
}

/**
 * Foydalanuvchi xabarnoma sozlamalarini olish
 */
export function useNotificationPreferences(options?: { enabled?: boolean }) {
  const { isAuthenticated } = useAuthStore();
  const isEnabled = (options?.enabled ?? true) && isAuthenticated;

  return useQuery<NotificationPreference>({
    queryKey: notificationKeys.preferences(),
    queryFn: () => notificationsApi.getPreferences(),
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Foydalanuvchi xabarnoma sozlamalarini yangilash
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NotificationPreferenceUpdatePayload) =>
      notificationsApi.updatePreferences(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(notificationKeys.preferences(), data);
      toast.success('Xabarnoma sozlamalari muvaffaqiyatli saqlandi!');
    },
    onError: (err) => {
      toast.error(parseNotificationError(err));
    },
  });
}
