'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import type { Cart } from '@/types/cart';

interface CartSummaryCardProps {
  cart: Cart;
  onCheckoutClick?: () => void;
  showCheckoutButton?: boolean;
}

export function CartSummaryCard({
  cart,
  onCheckoutClick,
  showCheckoutButton = true,
}: CartSummaryCardProps) {
  const subtotalNum = parseFloat(cart.subtotal || '0');
  const discountNum = parseFloat(cart.total_discount || '0');
  const totalNum = parseFloat(cart.total_price || '0');

  const hasUnavailable = cart.has_unavailable_items;
  const isCartEmpty = cart.is_empty || cart.total_items === 0;

  return (
    <Card className="rounded-2xl border shadow-sm sticky top-24">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base font-bold flex items-center justify-between">
          <span>Buyurtma xulosasi</span>
          <span className="text-xs font-normal text-muted-foreground">
            {cart.total_items} dona tovar
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-3.5 text-sm">
        {/* Tovar narxlari */}
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Mahsulotlar narxi</span>
          <span className="font-medium text-foreground">{formatPrice(subtotalNum)}</span>
        </div>

        {/* Chegirma */}
        {discountNum > 0 && (
          <div className="flex items-center justify-between text-emerald-600 font-medium">
            <span>Tejalgan summa</span>
            <span>-{formatPrice(discountNum)}</span>
          </div>
        )}

        {/* Yetkazib berish */}
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Yetkazib berish</span>
          <span className="text-emerald-600 font-semibold text-xs bg-emerald-50 px-2 py-0.5 rounded-md">
            Bepul
          </span>
        </div>

        {/* Omborda mavjud bo'lmagan tovarlar ogohlantirishi */}
        {hasUnavailable && (
          <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <span>
              Savatingizda omborda qolmagan tovarlar mavjud. Iltimos, ularni o'chiring yoki
              miqdorini kamaytiring.
            </span>
          </div>
        )}

        {/* Umumiy to'lov miqdori */}
        <div className="border-t pt-3.5 flex items-baseline justify-between">
          <div>
            <div className="text-base font-bold text-foreground">Jami to'lov:</div>
            <div className="text-[11px] text-muted-foreground">QQS va barcha soliqlar kiritilgan</div>
          </div>
          <div className="text-xl font-black text-primary">
            {formatPrice(totalNum)}
          </div>
        </div>
      </CardContent>

      {showCheckoutButton && (
        <CardFooter className="flex-col gap-3 pt-2">
          <Link
            href="/checkout"
            onClick={onCheckoutClick}
            className={`w-full ${isCartEmpty || hasUnavailable ? 'pointer-events-none' : ''}`}
          >
            <Button
              className="w-full h-12 text-sm font-bold gap-2 shadow-md cursor-pointer"
              disabled={isCartEmpty || hasUnavailable}
            >
              <span>Rasmiylashtirishga o'tish</span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>

          {/* Kafolatlar */}
          <div className="grid grid-cols-3 gap-2 w-full pt-3 border-t text-[11px] text-muted-foreground text-center">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="size-4 text-primary" />
              <span>Xavfsiz to'lov</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck className="size-4 text-primary" />
              <span>Tez yetkazish</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="size-4 text-primary" />
              <span>14 kun kafolat</span>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
