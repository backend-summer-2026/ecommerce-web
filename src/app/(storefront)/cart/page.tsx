'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Trash2,
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCartStore } from '@/features/cart/store/cartStore';
import { CartItemRow } from '@/features/cart/components/CartItemRow';
import { CartSummaryCard } from '@/features/cart/components/CartSummaryCard';
import { CartEmptyState } from '@/features/cart/components/CartEmptyState';

export default function CartPage() {
  const { cart, itemCount, isLoading, fetchCart, clearCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const items = cart?.items || [];
  const isEmpty = items.length === 0 && !isLoading;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8 min-h-[70vh]">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors">
          Bosh sahifa
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">Savatcha</span>
      </nav>

      {/* Sarlavha qatori */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <ShoppingBag className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <span>Savatcha</span>
              {itemCount > 0 && (
                <Badge variant="secondary" className="text-sm font-semibold px-2.5 py-0.5 rounded-full">
                  {itemCount} ta tovar
                </Badge>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Tanlangan mahsulotlarni ko'rib chiqing va buyurtmani davom ettiring
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => fetchCart()}
              disabled={isLoading}
              title="Yangilash"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Yangilash</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
              onClick={clearCart}
              disabled={isLoading}
              title="Savatdagi barcha tovarlarni o'chirish"
            >
              <Trash2 className="size-3.5" />
              <span>Savatni tozalash</span>
            </Button>
          </div>
        )}
      </div>

      {/* Kontent qismi */}
      {isLoading && items.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 border rounded-xl bg-card">
                <Skeleton className="size-24 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                  <div className="pt-4 flex justify-between">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        </div>
      ) : isEmpty ? (
        <div className="rounded-2xl border bg-card p-8 sm:p-16 shadow-2xs">
          <CartEmptyState />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Chap ustun: Mahsulotlar ro'yxati */}
          <div className="lg:col-span-8 space-y-4">
            {/* Ogohlantirish xabarlari (masalan, narx o'zgarganda) */}
            {cart?.warnings && cart.warnings.length > 0 && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-400 space-y-1">
                {cart.warnings.map((w, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <AlertCircle className="size-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Elementlar */}
            <div className="space-y-3">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            {/* Quyi navigatsiya */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t">
              <Link href="/catalog">
                <Button variant="ghost" size="sm" className="gap-2 text-xs font-semibold cursor-pointer">
                  <ArrowLeft className="size-4" />
                  <span>Xaridni davom ettirish</span>
                </Button>
              </Link>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Package className="size-4 text-primary" />
                <span>Ombor tekshiruvi har doim jonli tarzda amalga oshiriladi</span>
              </div>
            </div>
          </div>

          {/* O'ng ustun: Buyurtma xulosasi */}
          <div className="lg:col-span-4">
            {cart && <CartSummaryCard cart={cart} />}
          </div>
        </div>
      )}
    </div>
  );
}
