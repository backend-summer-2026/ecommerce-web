'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  useProducts,
  useCategories,
  useBrands,
  useProductDetail,
} from '@/features/catalog/hooks/useCatalog';
import { ProductListItem } from '@/types/catalog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';
import {
  Package,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Eye,
  Plus,
  Sparkles,
  Tag,
  CheckCircle,
  XCircle,
  SlidersHorizontal,
  Layers,
  Building2,
  X,
  AlertCircle,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [page, setPage] = useState(1);

  // Modallar
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Hooklar
  const {
    data: productsData,
    isLoading: isProductsLoading,
    refetch,
    isRefetching,
  } = useProducts({
    page,
    page_size: 15,
    q: searchQuery.trim() || undefined,
    category: selectedCategory || undefined,
    brand: selectedBrand || undefined,
    is_in_stock: stockFilter === 'all' ? undefined : stockFilter === 'in_stock',
  });

  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();

  // Quick View uchun tanlangan mahsulot
  const { data: selectedProductDetail, isLoading: isDetailLoading } = useProductDetail(
    selectedProductSlug || ''
  );

  const products = productsData?.results ?? [];
  const totalCount = productsData?.count ?? 0;
  const totalPages = productsData?.total_pages ?? 1;

  // Statisika hisoblash
  const onSaleCount = products.filter((p) => p.price.is_on_sale).length;
  const inStockCount = products.filter((p) => p.is_in_stock).length;

  return (
    <div className="space-y-6">
      {/* Sarlavha & Harakatlar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Package className="size-7 text-primary" />
            <span>Mahsulotlar Katalogi</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Do'kondagi barcha tovarlar, narxlar, brendlar va kategoriyalarni nazorat qilish.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-2 cursor-pointer"
          >
            <RefreshCw className={`size-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Yangilash</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2 font-bold cursor-pointer shadow-xs"
          >
            <Plus className="size-4" />
            <span>Yangi Mahsulot Qo'shish</span>
          </Button>
        </div>
      </div>

      {/* KPI Kartalar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Jami Mahsulotlar
            </CardTitle>
            <Package className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount} ta</div>
            <p className="text-xs text-muted-foreground mt-0.5">Faol katalog pozitsiyalari</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Omborda Mavjud
            </CardTitle>
            <CheckCircle className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {isProductsLoading ? '...' : `${inStockCount} ta`}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Xarid uchun ochiq tovarlar</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Aksiyadagi Tovarlar
            </CardTitle>
            <Tag className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {isProductsLoading ? '...' : `${onSaleCount} ta`}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Chegirmali maxsus takliflar</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Toifalar & Brendlar
            </CardTitle>
            <Layers className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.length} / {brands.length}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Toifalar va hamkor brendlar</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtrlar va Qidiruv */}
      <Card className="shadow-2xs">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Qidiruv */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Nomi bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9 text-sm"
              />
            </div>

            {/* Kategoriya filtri */}
            <div>
              <select
                aria-label="Kategoriya bo'yicha saralash"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Barcha Kategoriyalar</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brend filtri */}
            <div>
              <select
                aria-label="Brend bo'yicha saralash"
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Barcha Brendlar</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Holat filtri */}
            <div>
              <select
                aria-label="Ombor holati bo'yicha saralash"
                value={stockFilter}
                onChange={(e) => {
                  setStockFilter(e.target.value as 'all' | 'in_stock' | 'out_of_stock');
                  setPage(1);
                }}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">Barcha Holatlar</option>
                <option value="in_stock">Faqat Mavjudlar</option>
                <option value="out_of_stock">Tugaganlar</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mahsulotlar Jadvali */}
      <Card className="shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Mahsulot</th>
                <th className="py-3 px-4">Toifa & Brend</th>
                <th className="py-3 px-4">Narxi</th>
                <th className="py-3 px-4">Holat</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {isProductsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-12 rounded-lg" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-5 w-24" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-5 w-16" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <Package className="size-10 mx-auto mb-2 opacity-40" />
                    <p className="font-medium">Mahsulotlar topilmadi</p>
                    <p className="text-xs mt-1">Filtr parametrlarini o'zgartirib qayta urinib ko'ring.</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  return (
                    <ProductTableRow
                      key={product.id}
                      product={product}
                      onQuickView={() => setSelectedProductSlug(product.slug)}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <span className="text-xs text-muted-foreground">
              Jami <strong>{totalCount}</strong> ta tovardan {(page - 1) * 15 + 1} -{' '}
              {Math.min(page * 15, totalCount)} ko'rsatilmoqda
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="text-xs cursor-pointer"
              >
                Oldingi
              </Button>
              <span className="text-xs font-semibold px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="text-xs cursor-pointer"
              >
                Keyingi
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 1. Quick View Modal */}
      {selectedProductSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-card w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Package className="size-5 text-primary" />
                <h3 className="font-bold text-base">Mahsulot Tafsilotlari</h3>
              </div>
              <button
                onClick={() => setSelectedProductSlug(null)}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {isDetailLoading || !selectedProductDetail ? (
                <div className="space-y-4">
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    {/* Asosiy rasm */}
                    <div className="relative size-32 sm:size-40 rounded-xl overflow-hidden bg-muted/40 border shrink-0">
                      {selectedProductDetail.media?.[0]?.file ? (
                        <Image
                          src={selectedProductDetail.media[0].file}
                          alt={selectedProductDetail.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Package className="size-10 opacity-30" />
                        </div>
                      )}
                    </div>

                    {/* Ma'lumotlar */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {selectedProductDetail.brand && (
                          <Badge variant="outline" className="font-semibold text-xs">
                            {selectedProductDetail.brand.name}
                          </Badge>
                        )}
                        {selectedProductDetail.categories?.[0] && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                            {selectedProductDetail.categories.find((c) => c.is_primary)?.name ||
                              selectedProductDetail.categories[0].name}
                          </Badge>
                        )}
                        <Badge
                          className={
                            selectedProductDetail.is_in_stock
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-300'
                              : 'bg-destructive/10 text-destructive'
                          }
                        >
                          {selectedProductDetail.is_in_stock ? 'Omborda mavjud' : 'Tugagan'}
                        </Badge>
                      </div>

                      <h2 className="text-xl font-bold text-foreground">
                        {selectedProductDetail.name}
                      </h2>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {selectedProductDetail.short_description || selectedProductDetail.description}
                      </p>

                      <div className="pt-1">
                        <Link
                          href={`/products/${selectedProductDetail.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                        >
                          <span>Do'konda ko'rish</span>
                          <ExternalLink className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Variantlar jadvali */}
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-2.5 flex items-center gap-1.5">
                      <SlidersHorizontal className="size-4 text-primary" />
                      <span>Variantlar va Narxlar ({selectedProductDetail.variants?.length || 0})</span>
                    </h4>

                    <div className="border rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/40 font-semibold text-muted-foreground border-b">
                          <tr>
                            <th className="py-2.5 px-3">SKU</th>
                            <th className="py-2.5 px-3">Variant nomi</th>
                            <th className="py-2.5 px-3">Asosiy narx</th>
                            <th className="py-2.5 px-3">Chegirmali</th>
                            <th className="py-2.5 px-3 text-right">Holat</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selectedProductDetail.variants?.map((v) => (
                            <tr key={v.id} className="hover:bg-muted/20">
                              <td className="py-2.5 px-3 font-mono font-medium">{v.sku}</td>
                              <td className="py-2.5 px-3 font-semibold">{v.title || 'Asosiy'}</td>
                              <td className="py-2.5 px-3 text-muted-foreground">
                                {formatPrice(v.price)}
                              </td>
                              <td className="py-2.5 px-3">
                                {v.discount_price ? (
                                  <span className="font-bold text-emerald-600">
                                    {formatPrice(v.discount_price)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {v.is_default && (
                                  <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                                    Standart
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t bg-muted/20 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProductSlug(null)}
                className="cursor-pointer"
              >
                Yopish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Yangi Mahsulot Qo'shish Yo'riqnomasi Modali */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-card w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Plus className="size-5 text-primary" />
                <h3 className="font-bold text-base">Yangi Mahsulot Qo'shish</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Sparkles className="size-4" />
                  <span>Django Backoffice orqali boshqaruv</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tizimda mahsulotlar toifalari, ko'p atributli variantlari (rang, xotira, o'lcham),
                  rasmlari va ombor zaxiralari Django ma'lumotlar bazasi bilan mustahkam
                  bog'langan.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-foreground">Mahsulot qo'shish usullari:</h4>
                <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
                  <li>
                    <strong>Django Admin Paneli</strong>: Kategoriyalar, brendlar, media rasmlar va
                    narxlarni to'liq grafik interfeysda qo'shish.
                  </li>
                  <li>
                    <strong>Seeding Skripti</strong>: Yangi tovarlarni avtomatik tarzda rasmlari bilan
                    yuklash uchun <code>seed_products.py</code> skriptini ishga tushirish.
                  </li>
                  <li>
                    <strong>Ombor Boshqaruvi</strong>: Mavjud tovarlar zaxirasini{' '}
                    <Link href="/admin/inventory" className="text-primary underline">
                      /admin/inventory
                    </Link>{' '}
                    orqali tezkor o'zgartirish.
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <a
                  href="http://127.0.0.1:8000/admin/products/product/add/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:bg-primary/90 transition-all"
                >
                  <span>Django Admin Panelida Mahsulot Qo'shish</span>
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>

            <div className="p-4 border-t bg-muted/20 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
                className="cursor-pointer"
              >
                Tushundim
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Jadval qatori komponenti (rasm yuklanish xatosini alohida ushlab qoladi)
 */
function ProductTableRow({
  product,
  onQuickView,
}: {
  product: ProductListItem;
  onQuickView: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  const discountPercent =
    product.price.is_on_sale && product.price.default_discount_price
      ? Math.round(
          ((parseFloat(product.price.default_price) -
            parseFloat(product.price.default_discount_price)) /
            parseFloat(product.price.default_price)) *
            100
        )
      : 0;

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      {/* Mahsulot ma'lumotlari */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="relative size-12 rounded-lg overflow-hidden bg-muted/50 border shrink-0">
            {product.main_image && !imgError ? (
              <Image
                src={product.main_image}
                alt={product.name}
                fill
                sizes="48px"
                className="object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Package className="size-5 opacity-40" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-foreground truncate max-w-[240px] sm:max-w-xs">
              {product.name}
            </h4>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {product.short_description || product.slug}
            </p>
          </div>
        </div>
      </td>

      {/* Toifa & Brend */}
      <td className="py-3 px-4">
        <div className="flex flex-col gap-1 items-start">
          {product.brand && (
            <span className="font-semibold text-xs text-foreground flex items-center gap-1">
              <Building2 className="size-3 text-muted-foreground" />
              {product.brand.name}
            </span>
          )}
          {product.primary_category && (
            <Badge variant="outline" className="text-[10px] py-0 px-1.5">
              {product.primary_category.name}
            </Badge>
          )}
        </div>
      </td>

      {/* Narxi */}
      <td className="py-3 px-4">
        <div className="flex flex-col">
          {product.price.is_on_sale && product.price.default_discount_price ? (
            <>
              <span className="font-bold text-emerald-600">
                {formatPrice(product.price.default_discount_price)}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-muted-foreground line-through">
                  {formatPrice(product.price.default_price)}
                </span>
                <Badge variant="destructive" className="text-[9px] py-0 px-1">
                  -{discountPercent}%
                </Badge>
              </div>
            </>
          ) : (
            <span className="font-bold text-foreground">
              {formatPrice(product.price.default_price)}
            </span>
          )}
        </div>
      </td>

      {/* Ombor holati */}
      <td className="py-3 px-4">
        {product.is_in_stock ? (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-300 text-xs">
            Mavjud
          </Badge>
        ) : (
          <Badge variant="destructive" className="text-xs">
            Tugagan
          </Badge>
        )}
      </td>

      {/* Amallar */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onQuickView}
            className="size-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
            title="Tafsilotlarni ko'rish"
          >
            <Eye className="size-4" />
          </Button>

          <Link href={`/products/${product.slug}`} target="_blank">
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
              title="Do'konda ochish"
            >
              <ExternalLink className="size-4" />
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  );
}
