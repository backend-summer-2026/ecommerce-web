export type NotificationType = 'ORDER' | 'PAYMENT' | 'ACCOUNT' | 'PROMOTION' | 'SYSTEM';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface NotificationItem {
  id: number;
  notification_type: NotificationType;
  notification_type_display: string;
  priority: NotificationPriority;
  priority_display: string;
  title: string;
  is_read: boolean;
  read_at: string | null;
  action_url: string | null;
  created_at: string;
}

export interface NotificationDetail extends NotificationItem {
  user: number;
  message: string;
  data: Record<string, unknown> | null;
  updated_at: string;
}

export interface NotificationUnreadCount {
  unread_count: number;
  urgent_count: number;
}

export interface NotificationPreference {
  id: number;
  email_order_updates: boolean;
  email_payment_receipts: boolean;
  email_promotions: boolean;
  email_security_alerts: boolean;
  in_app_order_updates: boolean;
  in_app_payment_updates: boolean;
  in_app_promotions: boolean;
  created_at: string;
  updated_at: string;
}

export type NotificationPreferenceUpdatePayload = Partial<
  Omit<NotificationPreference, 'id' | 'created_at' | 'updated_at'>
>;

export interface NotificationFilterParams {
  is_read?: boolean | 'true' | 'false';
  type?: NotificationType;
  priority?: NotificationPriority;
  q?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedNotificationsResponse {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: NotificationItem[];
}

export interface MarkAllReadResponse {
  marked_read_count: number;
  message: string;
}

export interface ClearReadResponse {
  deleted_count: number;
  message: string;
}
