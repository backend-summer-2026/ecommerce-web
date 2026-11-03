export interface CategoryTreeItem {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  image: string | null;
  children: CategoryTreeItem[];
}

export interface CategoryBreadcrumb {
  id: number;
  name: string;
  slug: string;
}

export interface CategoryDetail {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  image: string | null;
  description: string | null;
  parent: {
    id: number;
    name: string;
    slug: string;
  } | null;
  breadcrumbs: CategoryBreadcrumb[];
  children: CategoryTreeItem[];
  products_count: number;
}

export interface BrandItem {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description?: string | null;
  website?: string | null;
  products_count: number;
}

export interface ProductPrice {
  min_price: string;
  max_price: string;
  min_final_price: string;
  default_price: string;
  default_discount_price: string | null;
  default_final_price: string;
  is_on_sale: boolean;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  brand: {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
  };
  primary_category: {
    id: number;
    name: string;
    slug: string;
  };
  main_image: string | null;
  price: ProductPrice;
  is_in_stock: boolean;
  created_at: string;
}

export interface PaginatedProductsResponse {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: ProductListItem[];
}

export interface ProductMedia {
  id: number;
  file: string;
  file_url: string;
  alt_text: string | null;
  media_type: 'image' | 'video' | string;
  is_main: boolean;
  order: number;
  variant: number | null;
}

export interface ProductVariantAttribute {
  attribute_name: string;
  attribute_slug: string;
  value: string;
  value_slug: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  title: string;
  price: string;
  discount_price: string | null;
  final_price: string;
  is_on_sale: boolean;
  is_default: boolean;
  is_active: boolean;
  available_quantity: number;
  is_in_stock: boolean;
  attributes: ProductVariantAttribute[];
  media: ProductMedia[];
}

export interface DynamicAttribute {
  name: string;
  slug: string;
  values: string[];
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  brand: {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    description: string | null;
    website: string | null;
    products_count: number;
  };
  categories: {
    id: number;
    name: string;
    slug: string;
    is_primary: boolean;
  }[];
  breadcrumbs: {
    id: number;
    name: string;
    slug: string;
  }[];
  short_description: string;
  description: string;
  media: ProductMedia[];
  variants: ProductVariant[];
  default_variant: ProductVariant;
  dynamic_attributes: DynamicAttribute[];
  is_in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface CatalogFilterPriceRange {
  min: string;
  max: string;
}

export interface CatalogFilterBrand {
  id: number;
  name: string;
  slug: string;
  product_count: number;
}

export interface CatalogFilterCategory {
  id: number;
  name: string;
  slug: string;
  product_count: number;
}

export interface CatalogFilterAttributeValue {
  id: number;
  value: string;
  slug: string;
  count: number;
}

export interface CatalogFilterAttribute {
  id: number;
  name: string;
  slug: string;
  values: CatalogFilterAttributeValue[];
}

export interface CatalogFiltersResponse {
  price_range: CatalogFilterPriceRange;
  brands: CatalogFilterBrand[];
  categories: CatalogFilterCategory[];
  attributes: CatalogFilterAttribute[];
}

export interface FeaturedProductsResponse {
  new_arrivals?: ProductListItem[];
  on_sale?: ProductListItem[];
  featured?: ProductListItem[];
}

export interface SearchSuggestProduct {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  price: string;
  brand: string;
}

export interface SearchSuggestCategory {
  id: number;
  name: string;
  slug: string;
}

export interface SearchSuggestBrand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
}

export interface SearchSuggestResponse {
  products: SearchSuggestProduct[];
  categories: SearchSuggestCategory[];
  brands: SearchSuggestBrand[];
}

export interface CatalogQueryParams {
  category?: string;
  brand?: string;
  min_price?: string | number;
  max_price?: string | number;
  in_stock?: boolean | string;
  q?: string;
  ordering?: string;
  page?: number | string;
  page_size?: number | string;
  [key: string]: string | number | boolean | undefined;
}
