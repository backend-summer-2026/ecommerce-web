'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import type { CartItem } from '@/types/cart';
import { useCartStore } from '@/features/cart/store/cartStore';

interface CartItemRowProps {
  item: CartItem;
  compact?: boolean;
  onItemClick?: () => void;
}

export function CartItemRow({ item, compact = false, onItemClick }: CartItemRowProps) {
  const { updateQuantity, removeItem, isUpdatingItem } = useCartStore();
  const [imgError, setImgError] = useState(false);

  const isUpdating = isUpdatingItem === item.id;
  const variant = item.variant;
  const isOutOfStock = !item.is_available || !variant.is_in_stock || variant.available_quantity <= 0;
  const maxAvailable = variant.available_quantity || 999;
  const canIncrement = item.quantity < maxAvailable && !isOutOfStock;

  const handleIncrement = () => {
    if (canIncrement && !isUpdating) {
      updateQuantity(item.id, item.quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (isUpdating) return;
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      removeItem(item.id);
    }
  };

  const handleRemove = () => {
    if (!isUpdating) {
      removeItem(item.id);
    }
  };

  const attributesList = Object.entries(variant.attributes || {});

  return (
    <div
      className={`relative flex gap-3 sm:gap-4 rounded-xl border bg-card text-card-foreground p-3 transition-colors ${
        compact ? 'items-start' : 'items-center p-4'
      } ${isOutOfStock ? 'opacity-70 bg-muted/40' : ''}`}
    >
      {/* Mahsulot rasmi */}
      <Link
        href={`/products/${variant.product_slug}`}
        onClick={onItemClick}
        className={`relative shrink-0 overflow-hidden rounded-lg border bg-muted/30 ${
          compact ? 'size-20' : 'size-24 sm:size-28'
        }`}
      >
        {variant.main_image && !imgError ? (
          <Image
            src={variant.main_image}
            alt={variant.product_name}
            fill
            sizes="120px"
            className="object-cover object-center transition-transform hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Sparkles className="size-6 opacity-40" />
          </div>
        )}
      </Link>

      {/* Mahsulot ma'lumotlari */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/products/${variant.product_slug}`}
              onClick={onItemClick}
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
              title={variant.product_name}
            >
              {variant.product_name}
            </Link>

            {/* O'chirish tugmasi */}
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
              onClick={handleRemove}
              disabled={isUpdating}
              title="Savatdan o'chirish"
            >
              {isUpdating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
            </Button>
          </div>

          {/* Variant xususiyatlari (Rang, O'lcham) */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {attributesList.map(([key, val]) => (
              <Badge key={key} variant="secondary" className="text-[11px] font-normal px-2 py-0">
                <span className="text-muted-foreground mr-1">{key}:</span> {val}
              </Badge>
            ))}
            {variant.sku && (
              <span className="text-[10px] text-muted-foreground font-mono">
                SKU: {variant.sku}
              </span>
            )}
          </div>

          {/* Ogohlantirishlar (Narx o'zgargan yoki qoldiq kam) */}
          {item.is_price_changed && (
            <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-1">
              <AlertCircle className="size-3" />
              <span>Narx o'zgardi</span>
            </div>
          )}

          {isOutOfStock && (
            <Badge variant="destructive" className="text-[10px] mt-1">
              Omborda qolmagan
            </Badge>
          )}
        </div>

        {/* Narx va Miqdor hisoblagichi */}
        <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
          {/* Miqdorni boshqarish */}
          <div className="flex items-center rounded-lg border bg-background shadow-2xs">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-none rounded-l-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-40"
              onClick={handleDecrement}
              disabled={isUpdating}
              title={item.quantity === 1 ? "Savatdan olib tashlash" : "Kamaytirish"}
            >
              {item.quantity === 1 ? (
                <Trash2 className="size-3 text-destructive" />
              ) : (
                <Minus className="size-3" />
              )}
            </Button>

            <span className="min-w-8 text-center text-xs font-semibold px-1">
              {isUpdating ? (
                <Loader2 className="size-3 animate-spin inline" />
              ) : (
                item.quantity
              )}
            </span>

            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-none rounded-r-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-40"
              onClick={handleIncrement}
              disabled={!canIncrement || isUpdating}
              title={!canIncrement ? "Ombordagi maksimal miqdorga yetdi" : "Ko'paytirish"}
            >
              <Plus className="size-3" />
            </Button>
          </div>

          {/* Narxlar (Birlik narxi va qatordagi jami narx) */}
          <div className="text-right">
            <div className="text-sm font-bold text-foreground">
              {formatPrice(item.total_price)}
            </div>
            {item.quantity > 1 && (
              <div className="text-[11px] text-muted-foreground">
                {formatPrice(item.current_unit_price || item.unit_price_at_addition)} / dona
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
