/**
 * Types and interfaces for Phase 8: Backoffice / Admin Dashboard
 */

import { OrderStatus, PaymentStatus, PaymentMethod, ShippingMethod } from './orders';

// ==========================================
// 1. Executive Analytics & KPIs
// ==========================================

export interface KPIPeriod {
  date_from: string;
  date_to: string;
  days: number;
}

export interface KPIMetrics {
  total_revenue: string;
  total_orders: number;
  completed_orders_count: number;
  cancelled_orders_count: number;
  average_order_value: string;
  new_customers_count: number;
  total_items_sold: number;
  refunded_amount: string;
}

export interface KPIGrowth {
  revenue_growth_pct: number;
  orders_growth_pct: number;
}

export interface ExecutiveKPIOverview {
  period: KPIPeriod;
  kpis: KPIMetrics;
  growth: KPIGrowth;
}

export interface SalesChartPoint {
  date: string;
  revenue: string;
  orders_count: number;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  sku: string;
  total_sold: number;
  total_revenue: string;
}

export interface TopCustomer {
  customer_id: number;
  email: string;
  name: string;
  phone_number: string | null;
  total_orders: number;
  total_spent: string;
}

// ==========================================
// 2. Inventory & Stock Management
// ==========================================

export interface DashboardInventoryItem {
  id: number;
  variant_id: number;
  sku: string;
  product_id: number;
  product_name: string;
  price: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  low_stock_threshold: number;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  updated_at: string;
}

export interface InventoryOverviewStats {
  total_products_count: number;
  total_variants_count: number;
  total_units_in_stock: number;
  total_units_reserved: number;
  low_stock_variants_count: number;
  out_of_stock_variants_count: number;
}

export type StockMovementType =
  | 'INCOMING'
  | 'OUTGOING'
  | 'ADJUSTMENT'
  | 'RETURN'
  | 'DAMAGED'
  | 'RESERVED';

export interface AdjustStockPayload {
  quantity_delta: number;
  reason?: string;
  movement_type?: StockMovementType;
}

export interface StockMovementLog {
  id: number;
  variant_id: number;
  variant_sku: string;
  product_name: string;
  actor_email: string;
  movement_type: StockMovementType;
  movement_type_display: string;
  quantity_delta: number;
  previous_quantity: number;
  new_quantity: number;
  reference_order_number: string | null;
  reason?: string;
  created_at: string;
}

// ==========================================
// 3. Order Management & Notes
// ==========================================

export interface DashboardOrderListItem {
  id: number;
  order_number: string;
  user_email: string;
  customer_name: string;
  status: OrderStatus;
  status_display: string;
  payment_status: PaymentStatus;
  payment_status_display: string;
  total_price: string;
  currency: string;
  items_count: number;
  internal_notes_count: number;
  created_at: string;
}

export interface DashboardOrderItem {
  id: number;
  product_name: string;
  variant_sku: string;
  variant_attributes_display?: string;
  unit_price: string;
  quantity: number;
  total_price: string;
}

export interface DashboardOrderAddress {
  recipient_name: string;
  phone_number: string;
  alternative_phone_number?: string | null;
  region: string;
  district: string;
  street_address: string;
  apartment_office?: string | null;
  postal_code?: string | null;
  delivery_instructions?: string | null;
}

export interface DashboardOrderDetail {
  id: number;
  order_number: string;
  user_id: number | null;
  user_email: string;
  user_phone: string;
  customer_name: string;
  status: OrderStatus;
  status_display: string;
  payment_status: PaymentStatus;
  payment_status_display: string;
  payment_method: PaymentMethod;
  shipping_method: ShippingMethod;
  subtotal: string;
  shipping_fee: string;
  discount_amount: string;
  total_price: string;
  currency: string;
  tracking_number?: string | null;
  shipping_address: DashboardOrderAddress;
  items: DashboardOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  tracking_number?: string;
  admin_notes?: string;
}

export interface OrderInternalNote {
  id: number;
  order_id: number;
  order_number: string;
  author_email: string;
  note: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddOrderInternalNotePayload {
  note: string;
  is_pinned?: boolean;
}

// ==========================================
// 4. Customer CRM & Status
// ==========================================

export interface DashboardCustomerListItem {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string | null;
  role?: string;
  is_active: boolean;
  is_staff: boolean;
  total_orders_count: number;
  total_spent: string;
  created_at: string;
}

export interface DashboardCustomerRecentOrder {
  order_number: string;
  status: string;
  total_price: string;
  created_at: string;
}

export interface DashboardCustomerDetail extends DashboardCustomerListItem {
  recent_orders: DashboardCustomerRecentOrder[] | string;
  updated_at: string;
}

export interface ToggleCustomerStatusPayload {
  is_active: boolean;
  reason?: string;
}

// ==========================================
// 5. Admin Payments & Refunds
// ==========================================

export interface AdminPaymentListItem {
  id: number;
  payment_number: string;
  order_number: string;
  amount: string;
  currency: string;
  provider: string;
  provider_display: string;
  status: string;
  status_display: string;
  user_email?: string;
  created_at: string;
  paid_at?: string | null;
}

export interface AdminPaymentDetail extends AdminPaymentListItem {
  transaction_id?: string | null;
  error_message?: string | null;
  logs?: Array<{
    id: number;
    event_type: string;
    description: string;
    created_at: string;
  }>;
}

export interface IssueRefundPayload {
  amount: string;
  reason?: string;
  provider_refund_id?: string;
}

export interface AdminRefundItem {
  id: number;
  refund_number: string;
  payment_number: string;
  order_number: string;
  amount: string;
  currency: string;
  status: string;
  status_display: string;
  reason: string;
  created_by_username: string;
  processed_at?: string | null;
  created_at: string;
}

export interface AdminTransactionLog {
  id: number;
  payment_number: string;
  event_type: string;
  provider: string;
  status: string;
  message?: string;
  raw_payload?: Record<string, unknown>;
  created_at: string;
}

// ==========================================
// 6. Admin Reviews Moderation
// ==========================================

export interface ModerateReviewPayload {
  status: 'APPROVED' | 'REJECTED';
  rejection_reason?: string;
}

export interface ReviewStoreReplyPayload {
  reply: string;
}

// ==========================================
// 7. Admin Notifications & Email Queue
// ==========================================

export interface BroadcastNotificationPayload {
  title: string;
  message: string;
  notification_type?: 'ORDER' | 'PAYMENT' | 'PROMOTION' | 'SYSTEM' | 'ACCOUNT';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  action_url?: string;
  broadcast?: boolean;
  recipient_type?: 'ALL' | 'STAFF';
  user_ids?: number[];
}

export interface EmailQueueItem {
  id: number;
  recipient_email: string;
  subject: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  template_code?: string;
  retry_count: number;
  error_message?: string | null;
  sent_at?: string | null;
  created_at: string;
}

export interface NotificationTemplate {
  id: number;
  code: string;
  name: string;
  description?: string;
  notification_type: 'ORDER' | 'PAYMENT' | 'PROMOTION' | 'SYSTEM' | 'ACCOUNT';
  notification_type_display: string;
  email_subject_template?: string;
  email_body_html_template?: string;
  email_body_text_template?: string;
  in_app_title_template?: string;
  in_app_message_template?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationTemplatePayload {
  code: string;
  name: string;
  description?: string;
  notification_type: 'ORDER' | 'PAYMENT' | 'PROMOTION' | 'SYSTEM' | 'ACCOUNT';
  email_subject_template?: string;
  email_body_html_template?: string;
  email_body_text_template?: string;
  in_app_title_template?: string;
  in_app_message_template?: string;
  is_active?: boolean;
}

export interface TestSendTemplatePayload {
  test_email?: string;
  user_id?: number | null;
  context_data?: Record<string, unknown>;
  send_email?: boolean;
  send_in_app?: boolean;
}

// ==========================================
// 8. Alerts & Audit Trail
// ==========================================

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertType =
  | 'LOW_STOCK'
  | 'PAYMENT_FAILURE'
  | 'HIGH_ORDER_VOLUME'
  | 'SECURITY'
  | 'SYSTEM_ERROR';

export interface SystemAlert {
  id: number;
  alert_type: AlertType;
  alert_type_display: string;
  severity: AlertSeverity;
  severity_display: string;
  title: string;
  message: string;
  is_resolved: boolean;
  resolved_by_email?: string;
  resolved_at?: string | null;
  created_at: string;
}

export type StaffActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'STATUS_CHANGE'
  | 'STOCK_ADJUSTMENT'
  | 'REFUND'
  | 'LOGIN'
  | 'EXPORT';

export type StaffModuleType =
  | 'ORDERS'
  | 'PRODUCTS'
  | 'INVENTORY'
  | 'USERS'
  | 'COUPONS'
  | 'PAYMENTS'
  | 'REVIEWS'
  | 'SETTINGS';

export interface StaffActivityLog {
  id: number;
  actor_id: number | null;
  actor_email: string;
  action: StaffActionType;
  action_display: string;
  module: StaffModuleType;
  module_display: string;
  target_model?: string;
  target_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, unknown>;
  created_at: string;
}
