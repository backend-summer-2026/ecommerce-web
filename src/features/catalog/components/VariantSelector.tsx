'use client';

import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import type { ProductVariant, DynamicAttribute } from '@/types/catalog';

interface VariantSelectorProps {
  variants: ProductVariant[];
  dynamicAttributes?: DynamicAttribute[];
  selectedVariant: ProductVariant;
  onVariantSelect: (variant: ProductVariant) => void;
}

export function VariantSelector({
  variants = [],
  selectedVariant,
  onVariantSelect,
}: VariantSelectorProps) {
  if (!variants || variants.length <= 1) {
    return null;
  }

  // Agar variantlar soni 2 yoki undan ko'p bo'lsa, variantlarni chiroyli ko'rinishda tanlash
  return (
    <div className="space-y-4 rounded-xl border p-4 bg-muted/20">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">
          Variantni tanlang:
        </label>
        <span className="text-xs text-muted-foreground font-mono">
          SKU: {selectedVariant.sku}
        </span>
      </div>

      {/* Variant kartalari ro'yxati */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {variants.map((v) => {
          const isSelected = v.id === selectedVariant.id;
          const isAvailable = v.is_in_stock && v.available_quantity > 0;

          return (
            <button
              key={v.id}
              type="button"
              disabled={!v.is_active}
              onClick={() => onVariantSelect(v)}
              className={`relative flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                  : 'border-border/70 hover:border-border hover:bg-background/80'
              } ${!v.is_active ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-xs leading-snug line-clamp-2">
                  {v.title || v.sku}
                </span>
                {isSelected && (
                  <div className="size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <Check className="size-2.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Atributlar teglari */}
              {v.attributes && v.attributes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {v.attributes.map((attr, idx) => (
                    <span
                      key={idx}
                      className="inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {attr.attribute_name}: <strong>{attr.value}</strong>
                    </span>
                  ))}
                </div>
              )}

              {/* Zaxira va narx */}
              <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">
                  ${v.final_price || v.price}
                </span>

                {isAvailable ? (
                  <span className="text-[11px] text-emerald-600 font-medium">
                    {v.available_quantity} ta qoldi
                  </span>
                ) : (
                  <span className="text-[11px] text-destructive font-medium flex items-center gap-1">
                    <AlertCircle className="size-3" />
                    Tugagan
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
