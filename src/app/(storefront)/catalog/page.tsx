'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { PackageSearch, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/features/catalog/components/ProductCard';
import { CatalogFilters } from '@/features/catalog/components/CatalogFilters';
import { CatalogToolbar } from '@/features/catalog/components/CatalogToolbar';
import { useProducts } from '@/features/catalog/hooks/useCatalog';
import type { CatalogQueryParams } from '@/types/catalog';

function CatalogContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // URL searchParams dan query obyektini shakllantirish
  const currentParams: CatalogQueryParams = {};
  searchParams.forEach((value, key) => {
    if (key.startsWith('attr_')) {
      currentParams[key as `attr_${string}`] = value;
    } else if (key === 'page') {
      currentParams.page = parseInt(value, 10) || 1;
    } else if (key === 'category' || key === 'brand' || key === 'min_price' || key === 'max_price' || key === 'in_stock' || key === 'q' || key === 'ordering') {
      (currentParams as Record<string, unknown>)[key] = value;
    }
  });

  const { data, isLoading, isFetching } = useProducts(currentParams);

  // URL parametrlarini yangilash yordamchisi
  const updateUrlParams = (newParams: Partial<CatalogQueryParams>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === undefined || val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleResetFilters = () => {
    router.push(pathname);
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = data?.total_pages || 1;
  const currentPage = data?.current_page || 1;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Sahifa bosh sarlavhasi */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Mahsulotlar Katalogi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Eng so'nggi texnologiyalar, elektronika va kiyim-kechaklar to'plami
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filtrlar Sidebari */}
        <div className="hidden lg:block lg:col-span-1 sticky top-20 rounded-2xl border bg-card p-5 shadow-2xs">
          <CatalogFilters
            currentParams={currentParams}
            onFilterChange={updateUrlParams}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobil Filtrlar Modali / Draweri */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="ml-auto w-full max-w-xs sm:max-w-sm h-full bg-background p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
              <CatalogFilters
                currentParams={currentParams}
                onFilterChange={updateUrlParams}
                onReset={handleResetFilters}
                isMobileModal
                onCloseMobileModal={() => setMobileFiltersOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Asosiy Mahsulotlar Qismi */}
        <div className="lg:col-span-3 space-y-6">
          {/* Asboblar paneli: Saralash, Soni, Faol teglar */}
          <CatalogToolbar
            totalCount={data?.count || 0}
            currentParams={currentParams}
            onFilterChange={updateUrlParams}
            onOpenMobileFilters={() => setMobileFiltersOpen(true)}
          />

          {/* Mahsulotlar ro'yxati */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 rounded-xl border p-4">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-5 w-4/5" />
                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="size-9 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : !data?.results || data.results.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed bg-muted/20 my-6">
              <PackageSearch className="size-16 text-muted-foreground stroke-1 mb-4" />
              <h3 className="text-lg font-bold">Hech qanday mahsulot topilmadi</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Tanlangan filtrlar yoki qidiruv so'rovi bo'yicha hech narsa chiqmadi. Filtrlarni o'zgartirib ko'ring.
              </p>
              <Button
                variant="outline"
                className="mt-5"
                onClick={handleResetFilters}
              >
                Barcha filtrlarni tozalash
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {data.results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Sahifalash (Pagination) */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isFetching}
                    aria-label="Oldingi sahifa"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        disabled={isFetching}
                        className="size-9 p-0 font-medium"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isFetching}
                    aria-label="Keyingi sahifa"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 sm:px-6 py-12 flex items-center justify-center min-h-[400px]">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
