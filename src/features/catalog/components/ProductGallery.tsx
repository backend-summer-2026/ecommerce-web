'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProductMedia } from '@/types/catalog';

interface ProductGalleryProps {
  media: ProductMedia[];
  productName: string;
  selectedVariantId?: number | null;
}

export function ProductGallery({
  media = [],
  productName,
  selectedVariantId,
}: ProductGalleryProps) {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [imgErrorMap, setImgErrorMap] = useState<Record<number, boolean>>({});

  const variantMediaIndex =
    selectedVariantId && media.length > 0
      ? media.findIndex((m) => m.variant === selectedVariantId)
      : -1;

  const activeIndex =
    selectedMediaIndex !== null
      ? selectedMediaIndex
      : variantMediaIndex !== -1
        ? variantMediaIndex
        : 0;

  const activeMedia = media[activeIndex] || media[0];

  const handlePrev = () => {
    setSelectedMediaIndex(activeIndex === 0 ? media.length - 1 : activeIndex - 1);
  };

  const handleNext = () => {
    setSelectedMediaIndex(activeIndex === media.length - 1 ? 0 : activeIndex + 1);
  };

  if (!media || media.length === 0) {
    return (
      <div className="relative aspect-square w-full rounded-2xl border bg-muted/40 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <Sparkles className="size-16 stroke-1 opacity-40 mb-3" />
        <p className="text-sm font-medium">{productName}</p>
        <span className="text-xs text-muted-foreground mt-1">Rasm mavjud emas</span>
      </div>
    );
  }

  const currentFileUrl = activeMedia?.file_url || activeMedia?.file;
  const isCurrentError = imgErrorMap[activeMedia?.id ?? -1];

  return (
    <div className="flex flex-col gap-4">
      {/* Asosiy Rasm Oynasi */}
      <div className="group relative aspect-square w-full overflow-hidden rounded-2xl border bg-muted/20 shadow-xs">
        {currentFileUrl && !isCurrentError ? (
          <Image
            src={currentFileUrl}
            alt={activeMedia?.alt_text || productName}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            onError={() => {
              if (activeMedia?.id) {
                setImgErrorMap((prev) => ({ ...prev, [activeMedia.id]: true }));
              }
            }}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
            <Sparkles className="size-16 stroke-1 opacity-30 mb-2" />
            <span className="text-xs">{productName}</span>
          </div>
        )}

        {/* Galereya navigatsiya strelkalari (agar bir nechta rasm bo'lsa) */}
        {media.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full opacity-80 shadow-md backdrop-blur transition-opacity hover:opacity-100 hover:bg-background"
              aria-label="Oldingi rasm"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full opacity-80 shadow-md backdrop-blur transition-opacity hover:opacity-100 hover:bg-background"
              aria-label="Keyingi rasm"
            >
              <ChevronRight className="size-5" />
            </Button>
          </>
        )}
      </div>

      {/* Miniatyuralar qatori (Thumbnails strip) */}
      {media.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {media.map((item, idx) => {
            const isSelected = idx === activeIndex;
            const fileUrl = item.file_url || item.file;
            const isError = imgErrorMap[item.id];

            return (
              <button
                key={item.id || idx}
                type="button"
                onClick={() => setSelectedMediaIndex(idx)}
                className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 bg-muted/20 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 scale-102'
                    : 'border-border/60 opacity-70 hover:opacity-100 hover:border-primary/50'
                }`}
              >
                {fileUrl && !isError ? (
                  <Image
                    src={fileUrl}
                    alt={item.alt_text || `${productName} ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                    onError={() => setImgErrorMap((prev) => ({ ...prev, [item.id]: true }))}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Sparkles className="size-5 opacity-40" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
