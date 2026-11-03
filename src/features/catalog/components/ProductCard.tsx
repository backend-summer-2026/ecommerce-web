'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Check, PackageX, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import type { ProductListItem } from '@/types/catalog';

interface ProductCardProps {
  product: ProductListItem;
  onAddToCart?: (product: ProductListItem) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const { name, slug, brand, primary_category, main_image, price, is_in_stock } = product;

  // Chegirma foizini hisoblash
  const discountPercent =
    price.is_on_sale && price.default_discount_price
      ? Math.round(
          ((parseFloat(price.default_price) - parseFloat(price.default_discount_price)) /
            parseFloat(price.default_price)) *
            100
        )
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!is_in_stock) {
      toast.error('Ushbu mahsulot hozirda omborda mavjud emas');
      return;
    }

    if (onAddToCart) {
      onAddToCart(product);
    } else {
      setIsAdded(true);
      toast.success(`"${name}" savatchaga qo'shildi!`);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      {/* Rasm va Badjlar */}
      <Link href={`/products/${slug}`} className="relative aspect-square w-full overflow-hidden bg-muted/40">
        {main_image && !imgError ? (
          <Image
            src={main_image}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-muted/30 text-muted-foreground p-4 text-center">
            <Sparkles className="size-10 mb-2 stroke-1 opacity-50" />
            <span className="text-xs font-medium line-clamp-1">{name}</span>
          </div>
        )}

        {/* Status Badjlari */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {price.is_on_sale && discountPercent > 0 && (
            <Badge variant="destructive" className="font-semibold text-xs shadow-xs px-2 py-0.5">
              -{discountPercent}%
            </Badge>
          )}
          {!is_in_stock && (
            <Badge variant="secondary" className="bg-background/90 text-destructive text-xs font-semibold backdrop-blur">
              <PackageX className="size-3 mr-1 inline" />
              Tugagan
            </Badge>
          )}
        </div>

        {/* Brend Badji */}
        {brand && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="inline-flex items-center rounded-md bg-background/85 px-2 py-0.5 text-[11px] font-medium text-foreground backdrop-blur shadow-2xs">
              {brand.name}
            </span>
          </div>
        )}
      </Link>

      {/* Kontent */}
      <div className="flex flex-1 flex-col p-4">
        {/* Kategoriya */}
        {primary_category && (
          <Link
            href={`/catalog?category=${primary_category.slug}`}
            className="mb-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {primary_category.name}
          </Link>
        )}

        {/* Nomi */}
        <Link href={`/products/${slug}`} className="group-hover:text-primary transition-colors">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2" title={name}>
            {name}
          </h3>
        </Link>

        {/* Narx va Savatcha tugmasi */}
        <div className="mt-auto pt-3 flex items-end justify-between gap-2 border-t border-border/40">
          <div className="flex flex-col">
            {price.is_on_sale && price.default_discount_price ? (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(price.default_price)}
                </span>
                <span className="text-base font-bold text-destructive">
                  {formatPrice(price.default_discount_price)}
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-foreground">
                {formatPrice(price.default_final_price || price.default_price)}
              </span>
            )}
          </div>

          <Button
            size="icon"
            variant={isAdded ? 'default' : 'secondary'}
            className="size-9 rounded-lg shrink-0 transition-all hover:bg-primary hover:text-primary-foreground"
            onClick={handleAddToCart}
            disabled={!is_in_stock}
            title={is_in_stock ? "Savatchaga qo'shish" : 'Sotuvda mavjud emas'}
          >
            {isAdded ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
