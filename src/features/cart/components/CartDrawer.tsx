'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/features/cart/store/cartStore';
import { CartItemRow } from './CartItemRow';
import { CartEmptyState } from './CartEmptyState';

export function CartDrawer() {
  const router = useRouter();
  const {
    cart,
    itemCount,
    totalPrice,
    isDrawerOpen,
    closeDrawer,
    fetchCart,
    clearCart,
    isLoading,
  } = useCartStore();

  // Drawer ochilganda eng so'nggi ma'lumotlarni olish
  useEffect(() => {
    if (isDrawerOpen) {
      fetchCart();
    }
  }, [isDrawerOpen, fetchCart]);

  // ESC tugmasi orqali yopish va body scrollni bloklash
  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDrawer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const items = cart?.items || [];
  const isEmpty = items.length === 0;
  const hasUnavailable = cart?.has_unavailable_items;

  const handleCheckout = () => {
    closeDrawer();
    router.push('/checkout');
  };

  const handleGoToCartPage = () => {
    closeDrawer();
    router.push('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Qorong'u orqa fon (Backdrop) */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Slayder paneli (Slide-over drawer) */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Savatcha"
          className="w-screen max-w-md bg-background text-foreground shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-250 ease-out"
        >
          {/* Sarlavha (Header) */}
          <div className="flex items-center justify-between border-b px-5 py-4 shrink-0 bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ShoppingBag className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <span>Savatcha</span>
                  {itemCount > 0 && (
                    <Badge variant="secondary" className="text-xs px-2 py-0">
                      {itemCount}
                    </Badge>
                  )}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!isEmpty && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2 cursor-pointer"
                  onClick={clearCart}
                  title="Savatni tozalash"
                >
                  <Trash2 className="size-3.5 mr-1" />
                  <span>Tozalash</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                onClick={closeDrawer}
                aria-label="Yopish"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Ogohlantirish bannerlari (agar mavjud bo'lsa) */}
          {cart?.warnings && cart.warnings.length > 0 && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-400 space-y-1">
              {cart.warnings.map((w, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tovar elementlari ro'yxati (Scrollable content) */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {isLoading && items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="size-7 animate-spin mb-2" />
                <span className="text-xs">Savatcha yuklanmoqda...</span>
              </div>
            ) : isEmpty ? (
              <CartEmptyState onActionClick={closeDrawer} />
            ) : (
              items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  compact
                  onItemClick={closeDrawer}
                />
              ))
            )}
          </div>

          {/* Pastki qism (Sticky Footer) */}
          {!isEmpty && (
            <div className="border-t bg-muted/10 p-5 shrink-0 space-y-4">
              {/* Narx hisoboti */}
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Jami mahsulotlar:</span>
                  <span>{formatPrice(cart?.subtotal || totalPrice)}</span>
                </div>

                {parseFloat(cart?.total_discount || '0') > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-medium text-xs">
                    <span>Chegirma:</span>
                    <span>-{formatPrice(cart?.total_discount || 0)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between font-bold text-base pt-2 border-t text-foreground">
                  <span>Yakuniy narx:</span>
                  <span className="text-primary text-lg font-black">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Amal tugmalari */}
              <div className="grid grid-cols-1 gap-2.5">
                <Button
                  className="w-full h-11 text-sm font-bold gap-2 shadow-md cursor-pointer"
                  onClick={handleCheckout}
                  disabled={hasUnavailable}
                >
                  <span>Buyurtmaga o'tish</span>
                  <ArrowRight className="size-4" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-10 text-xs font-semibold cursor-pointer"
                  onClick={handleGoToCartPage}
                >
                  To'liq savatchani ko'rish
                </Button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
