import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../api/catalogApi';
import type { CatalogQueryParams, CreateProductPayload } from '@/types/catalog';

export const catalogKeys = {
  all: ['catalog'] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  categoryDetail: (slug: string) => [...catalogKeys.categories(), slug] as const,
  brands: (q?: string) => [...catalogKeys.all, 'brands', { q }] as const,
  brandDetail: (slug: string) => [...catalogKeys.all, 'brand', slug] as const,
  products: (params?: CatalogQueryParams) => [...catalogKeys.all, 'products', params] as const,
  productDetail: (slug: string) => [...catalogKeys.all, 'product', slug] as const,
  variantDetail: (slug: string, sku: string) => [...catalogKeys.productDetail(slug), 'variant', sku] as const,
  filters: (categorySlug?: string) => [...catalogKeys.all, 'filters', { categorySlug }] as const,
  searchSuggest: (query: string) => [...catalogKeys.all, 'search-suggest', query] as const,
  featured: () => [...catalogKeys.all, 'featured'] as const,
};

/**
 * Barcha kategoriyalar daraxtini olish uchun hook
 */
export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: () => catalogApi.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 daqiqa kesh
  });
}

/**
 * Muayyan kategoriya tafsilotlarini olish uchun hook
 */
export function useCategoryDetail(slug: string) {
  return useQuery({
    queryKey: catalogKeys.categoryDetail(slug),
    queryFn: () => catalogApi.getCategoryDetail(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Brendlar ro'yxatini olish uchun hook
 */
export function useBrands(q?: string) {
  return useQuery({
    queryKey: catalogKeys.brands(q),
    queryFn: () => catalogApi.getBrands(q),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Brend tafsilotlarini olish uchun hook
 */
export function useBrandDetail(slug: string) {
  return useQuery({
    queryKey: catalogKeys.brandDetail(slug),
    queryFn: () => catalogApi.getBrandDetail(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Mahsulotlarni sahifalash va dinamik filtrlar bilan olish uchun hook
 */
export function useProducts(params?: CatalogQueryParams) {
  return useQuery({
    queryKey: catalogKeys.products(params),
    queryFn: () => catalogApi.getProducts(params),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000, // 1 daqiqa
  });
}

/**
 * Mahsulot tafsilotlarini olish uchun hook
 */
export function useProductDetail(slug: string) {
  return useQuery({
    queryKey: catalogKeys.productDetail(slug),
    queryFn: () => catalogApi.getProductDetail(slug),
    enabled: Boolean(slug),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Variant ma'lumotlarini olish uchun hook
 */
export function useProductVariant(slug: string, sku: string) {
  return useQuery({
    queryKey: catalogKeys.variantDetail(slug, sku),
    queryFn: () => catalogApi.getProductVariant(slug, sku),
    enabled: Boolean(slug && sku),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Dinamik filtr fasetlarini olish uchun hook
 */
export function useCatalogFilters(categorySlug?: string) {
  return useQuery({
    queryKey: catalogKeys.filters(categorySlug),
    queryFn: () => catalogApi.getFilters(categorySlug),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Qidiruv autocomplete takliflarini olish hooki (debounced query bilan)
 */
export function useSearchSuggestions(query: string, enabled = true) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: catalogKeys.searchSuggest(trimmed),
    queryFn: () => catalogApi.getSearchSuggestions(trimmed),
    enabled: enabled && trimmed.length >= 2,
    staleTime: 30 * 1000,
  });
}

/**
 * Ommabop va yangi mahsulotlarni olish uchun hook
 */
export function useFeaturedProducts() {
  return useQuery({
    queryKey: catalogKeys.featured(),
    queryFn: () => catalogApi.getFeatured(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Yangi mahsulot yaratish uchun mutatsiya hooki
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductPayload) => catalogApi.createProduct(payload),
    onSuccess: () => {
      // Barcha mahsulotlar keshlarini tozalash va qayta yuklash
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
    },
  });
}
