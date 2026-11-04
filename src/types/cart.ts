export interface CartItemVariant {
  id: number;
  sku: string;
  title: string;
  product_id: number;
  product_name: string;
  product_slug: string;
  main_image: string | null;
  attributes: Record<string, string>;
  price: string;
  discount_price: string | null;
  final_price: number | string;
  is_in_stock: boolean;
  available_quantity: number;
}

export interface CartItem {
  id: number;
  variant: CartItemVariant;
  quantity: number;
  unit_price_at_addition: string;
  current_unit_price: string;
  subtotal: string;
  total_price: string;
  discount_amount: string;
  is_price_changed: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  status: string;
  items: CartItem[];
  total_items: number;
  unique_items_count: number;
  subtotal: string;
  total_price: string;
  total_discount: string;
  is_empty: boolean;
  has_unavailable_items: boolean;
  warnings: string[];
  created_at: string;
  updated_at: string;
}

export interface CartSummary {
  id: string;
  total_items: number;
  unique_items_count: number;
  total_price: string;
  is_empty: boolean;
}

export interface AddToCartPayload {
  variant_id: number;
  quantity?: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

export interface MergeCartPayload {
  guest_cart_id?: string | null;
  guest_session_key?: string | null;
}
