'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  CreditCard,
  Sparkles,
  Layers,
  Tag,
  Flame,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/features/catalog/components/ProductCard';
import {
  useFeaturedProducts,
  useCategories,
  useBrands,
} from '@/features/catalog/hooks/useCatalog';

export default function HomePage() {
  const [featuredTab, setFeaturedTab] = useState<'new' | 'sale'>('new');

  const { data: featuredData, isLoading: isFeaturedLoading } = useFeaturedProducts();
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
  const { data: brands = [], isLoading: isBrandsLoading } = useBrands();

  const newArrivals = featuredData?.new_arrivals || [];
  const onSale = featuredData?.on_sale || [];

  const activeProducts = featuredTab === 'new' ? newArrivals : onSale;

  return (
    <div className="flex flex-col gap-14 pb-20">
      {/* 1. Katta Zamonaviy Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background py-16 sm:py-24 border-b">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-xs font-semibold text-primary shadow-xs backdrop-blur">
              <Sparkles className="size-4 text-primary animate-pulse" />
              <span>Yangi avlod gadjetlari va mahsulotlar kolleksiyasi</span>
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-6xl text-foreground leading-tight">
              Sifatli texnika, ishonchli xarid va tezkor yetkazib berish
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Eng so'nggi Apple, Samsung, Nike va boshqa xalqaro brendlarning asl tovarlari.
              Click va Payme orqali xavfsiz to'lov, Toshkent bo'ylab 24 soatda eshikkacha yetkazish.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <Link href="/catalog">
                <Button size="lg" className="gap-2 font-bold px-6 shadow-md cursor-pointer">
                  <span>Katalogni ko'rish</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/categories">
                <Button variant="outline" size="lg" className="font-semibold cursor-pointer">
                  Toifalarni ko'rish
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Kategoriyalar Bloki */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Layers className="size-5 text-primary" />
              <span>Ommabop Toifalar</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Kerakli yo'nalish bo'yicha tovarlarni tanlang
            </p>
          </div>

          <Link
            href="/categories"
            className="text-xs sm:text-sm font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Barchasi</span>
            <ChevronRight className="size-4" />
          </Link>
        </div>

        {isCategoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border space-y-2 text-center">
                <Skeleton className="size-12 rounded-full mx-auto" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalog?category=${cat.slug}`}
                className="group flex items-center gap-3.5 p-4 rounded-2xl border bg-card hover:bg-primary/5 hover:border-primary/50 transition-all shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
              >
                <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Layers className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {cat.children?.length ? `${cat.children.length} ta kichik toifa` : "Ko'rish"}
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. Tanlangan Mahsulotlar (Featured / New Arrivals / On Sale) */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Tavsiya Etilgan Mahsulotlar
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Eng so'nggi qo'shilgan va aksiyadagi tovarlar to'plami
            </p>
          </div>

          {/* Tablar */}
          <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFeaturedTab('new')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                featuredTab === 'new'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="size-3.5 text-primary" />
              <span>Yangi kelganlar ({newArrivals.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFeaturedTab('sale')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                featuredTab === 'sale'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Flame className="size-3.5 text-destructive" />
              <span>Aksiyalar ({onSale.length})</span>
            </button>
          </div>
        </div>

        {isFeaturedLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
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
        ) : activeProducts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border bg-muted/20">
            <Sparkles className="size-12 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground text-sm">
              Hozircha ushbu bo'limda mahsulotlar mavjud emas
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {activeProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/catalog">
            <Button variant="outline" size="lg" className="font-semibold cursor-pointer">
              <span>Barcha mahsulotlar katalogiga o'tish</span>
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 4. Brendlar Kolleksiyasi */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Tag className="size-5 text-primary" />
              <span>Yetakchi Brendlar</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Rasmiy kafolatga ega tovarlar
            </p>
          </div>

          <Link
            href="/brands"
            className="text-xs sm:text-sm font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Barcha brendlar</span>
            <ChevronRight className="size-4" />
          </Link>
        </div>

        {isBrandsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/catalog?brand=${b.slug}`}
                className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-center shadow-2xs hover:shadow-xs group"
              >
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base mb-2 group-hover:scale-110 transition-transform">
                  {b.name[0]}
                </div>
                <h4 className="font-semibold text-sm truncate w-full group-hover:text-primary transition-colors">
                  {b.name}
                </h4>
                <span className="text-[11px] text-muted-foreground">
                  {b.products_count} ta tovar
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 5. Do'kon Afzalliklari (Value Propositions) */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-6 rounded-2xl border bg-card shadow-2xs">
            <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Truck className="size-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Tezkor yetkazib berish</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Toshkent bo'ylab 24 soatda, viloyatlarga 2-3 kunda
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 rounded-2xl border bg-card shadow-2xs">
            <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CreditCard className="size-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Xavfsiz to'lovlar</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Payme, Click va saqlangan kartalar orqali
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 rounded-2xl border bg-card shadow-2xs">
            <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Rasmiy kafolat</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                100% original tovarlar va 14 kunlik qaytarish kafolati
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
