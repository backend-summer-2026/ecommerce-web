export type OrderStatus =
  | 'PENDING'
  | 'AWAITING_PAYMENT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'FAILED';

export type PaymentMethod =
  | 'PAYME'
  | 'CLICK'
  | 'UZUM'
  | 'CASH_ON_DELIVERY'
  | 'CARD_ON_DELIVERY';

export type ShippingMethod = 'STANDARD' | 'EXPRESS' | 'PICKUP';

export interface OrderAddress {
  id?: number;
  recipient_name: string;
  phone_number: string;
  alternative_phone_number?: string;
  region: string;
  district: string;
  street_address: string;
  apartment_office?: string;
  postal_code?: string;
  landmark?: string;
  latitude?: number | null;
  longitude?: number | null;
  delivery_instructions?: string;
  full_address?: string;
}

export interface CheckoutPreviewItem {
  item_id: number;
  variant_id: number;
  product_name: string;
  variant_sku: string;
  variant_title: string;
  variant_attributes_display: string;
  image_url: string | null;
  quantity: number;
  unit_price: string;
  subtotal: string;
  total_price: string;
  available_quantity: number;
  is_available: boolean;
  is_price_changed: boolean;
}

export interface CheckoutPreviewInput {
  shipping_method?: ShippingMethod;
  coupon_code?: string | null;
  region?: string;
}

export interface CheckoutPreviewResponse {
  cart_id: string;
  total_items: number;
  subtotal: string;
  shipping_method: string;
  shipping_fee: string;
  coupon_code: string | null;
  coupon_message: string | null;
  discount_amount: string;
  total_price: string;
  currency: string;
  has_stock_issues: boolean;
  warnings: string[];
  items: CheckoutPreviewItem[];
}

export interface CouponValidationResponse {
  is_valid: boolean;
  message: string;
  code: string | null;
  discount_amount: string;
  coupon?: {
    code: string;
    discount_type: string;
    discount_value: string;
    min_order_amount: string;
    max_discount_amount: string | null;
    valid_from: string;
    valid_until: string;
    is_active: boolean;
  } | null;
}

export interface OrderCreatePayload {
  shipping_address: OrderAddress;
  shipping_method: ShippingMethod;
  payment_method: PaymentMethod;
  coupon_code?: string | null;
  customer_notes?: string;
}

export interface OrderItem {
  id: number;
  variant_id: number;
  product_name: string;
  variant_sku: string;
  variant_attributes_display: string;
  attributes_snapshot: Record<string, string>;
  unit_price: string;
  quantity: number;
  total_price: string;
  image_url: string | null;
}

export interface OrderStatusHistory {
  id: number;
  old_status: OrderStatus;
  new_status: OrderStatus;
  comment: string;
  created_by_name: string | null;
  is_customer_visible: boolean;
  created_at: string;
}

export interface OrderListItem {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  shipping_method: ShippingMethod;
  total_items: number;
  total_price: string;
  currency: string;
  created_at: string;
}

export interface OrderDetail {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  shipping_method: ShippingMethod;
  subtotal: string;
  shipping_fee: string;
  discount_amount: string;
  total_price: string;
  currency: string;
  tracking_number: string | null;
  customer_notes: string;
  cancellation_reason: string | null;
  can_cancel: boolean;
  total_items: number;
  paid_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  shipping_address: OrderAddress;
  items: OrderItem[];
  status_history: OrderStatusHistory[];
}

export interface OrderTrackingResponse {
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  shipping_method: ShippingMethod;
  tracking_number: string | null;
  created_at: string;
  paid_at: string | null;
  delivered_at: string | null;
  timeline: OrderStatusHistory[];
}

export interface OrderInvoice {
  order_number: string;
  created_at: string;
  paid_at: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  shipping_method: ShippingMethod;
  shipping_address: OrderAddress;
  items: OrderItem[];
  total_items: number;
  subtotal: string;
  shipping_fee: string;
  discount_amount: string;
  total_price: string;
  currency: string;
}
