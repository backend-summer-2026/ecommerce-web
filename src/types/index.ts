export * from './auth';
export * from './catalog';
export * from './cart';
export * from './orders';
export * from './reviews';
export type {
  PaymentProvider,
  CardProvider,
  CardBrand,
  SavedCard,
  AddCardPayload,
  AddCardResponse,
  VerifyCardPayload,
  VerifyCardResponse,
  InitializePaymentPayload,
  InitializePaymentResponse,
  PayWithCardPayload,
  PayWithCardResponse,
  PaymentItem,
  CancelPaymentPayload,
} from './payments';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent?: number | null;
  children?: Category[];
  image?: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  price: string | number;
  discount_price?: string | number | null;
  stock_quantity: number;
  in_stock: boolean;
  attributes: Record<string, string>;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  description?: string;
  category: Category;
  brand: Brand;
  variants: ProductVariant[];
  base_price: string | number;
  rating?: number;
  reviews_count?: number;
  featured_image?: string;
  images?: string[];
  in_stock: boolean;
  created_at: string;
}
