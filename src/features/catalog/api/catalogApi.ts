import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import type {
  CategoryTreeItem,
  CategoryDetail,
  BrandItem,
  PaginatedProductsResponse,
  ProductDetail,
  ProductVariant,
  CatalogFiltersResponse,
  FeaturedProductsResponse,
  SearchSuggestResponse,
  CatalogQueryParams,
} from '@/types/catalog';

export const catalogApi = {
  /**
   * Daraxtsimon kategoriyalar ro'yxatini olish
   */
  async getCategories(): Promise<CategoryTreeItem[]> {
    const { data } = await apiClient.get<CategoryTreeItem[]>(API_ENDPOINTS.CATALOG.CATEGORIES);
    return data;
  },

  /**
   * Muayyan kategoriya tafsilotlari (breadcrumbs, bolalar, soni)
   */
  async getCategoryDetail(slug: string): Promise<CategoryDetail> {
    const { data } = await apiClient.get<CategoryDetail>(API_ENDPOINTS.CATALOG.CATEGORY_DETAIL(slug));
    return data;
  },

  /**
   * Brendlar ro'yxatini olish
   */
  async getBrands(q?: string): Promise<BrandItem[]> {
    const { data } = await apiClient.get<BrandItem[]>(API_ENDPOINTS.CATALOG.BRANDS, {
      params: q ? { q } : undefined,
    });
    return data;
  },

  /**
   * Brend tafsilotlari
   */
  async getBrandDetail(slug: string): Promise<BrandItem> {
    const { data } = await apiClient.get<BrandItem>(API_ENDPOINTS.CATALOG.BRAND_DETAIL(slug));
    return data;
  },

  /**
   * Mahsulotlar ro'yxati (Filtrlar va sahifalash bilan)
   */
  async getProducts(params?: CatalogQueryParams): Promise<PaginatedProductsResponse> {
    const { data } = await apiClient.get<PaginatedProductsResponse>(API_ENDPOINTS.CATALOG.PRODUCTS, {
      params,
    });
    return data;
  },

  /**
   * Mahsulot tafsilotlari (variantlar, galereya, xususiyatlar)
   */
  async getProductDetail(slug: string): Promise<ProductDetail> {
    const { data } = await apiClient.get<ProductDetail>(API_ENDPOINTS.CATALOG.PRODUCT_DETAIL(slug));
    return data;
  },

  /**
   * Mahsulot varianti tafsilotlari (SKU bo'yicha)
   */
  async getProductVariant(slug: string, sku: string): Promise<ProductVariant> {
    const { data } = await apiClient.get<ProductVariant>(API_ENDPOINTS.CATALOG.VARIANT_DETAIL(slug, sku));
    return data;
  },

  /**
   * Dinamik fasetli filtrlar (kategoriya bo'yicha yoki umumiy)
   */
  async getFilters(categorySlug?: string): Promise<CatalogFiltersResponse> {
    const { data } = await apiClient.get<CatalogFiltersResponse>(API_ENDPOINTS.CATALOG.FILTERS, {
      params: categorySlug ? { category: categorySlug } : undefined,
    });
    return data;
  },

  /**
   * Qidiruv takliflari (Autocomplete)
   */
  async getSearchSuggestions(query: string): Promise<SearchSuggestResponse> {
    if (!query || query.trim().length === 0) {
      return { products: [], categories: [], brands: [] };
    }
    const { data } = await apiClient.get<SearchSuggestResponse>(API_ENDPOINTS.CATALOG.SUGGEST, {
      params: { q: query },
    });
    return data;
  },

  /**
   * Ommabop va yangi mahsulotlar (Featured / New Arrivals / On Sale)
   */
  async getFeatured(): Promise<FeaturedProductsResponse> {
    const { data } = await apiClient.get<FeaturedProductsResponse>(API_ENDPOINTS.CATALOG.FEATURED);
    return data;
  },
};
