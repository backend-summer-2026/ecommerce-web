'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReviewImage } from '@/types/reviews';

interface ReviewImageLightboxProps {
  images: ReviewImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function ReviewImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
}: ReviewImageLightboxProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onIndexChange(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        onIndexChange(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, currentIndex, images.length, onClose, onIndexChange]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  if (!currentImage) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Yuqori panel: Yopish va hisoblagich */}
      <div
        className="absolute top-4 right-4 flex items-center gap-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white/80 text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          aria-label="Yopish"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Chap / O'ng navigatsiya tugmalari */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange((currentIndex - 1 + images.length) % images.length);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors z-10 cursor-pointer"
            aria-label="Oldingi rasm"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange((currentIndex + 1) % images.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors z-10 cursor-pointer"
            aria-label="Keyingi rasm"
          >
            <ChevronRight className="size-6" />
          </button>
        </>
      )}

      {/* Markaziy rasm va izoh */}
      <div
        className="relative max-w-4xl max-h-[85vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-[65vh] max-w-3xl flex items-center justify-center">
          <Image
            src={currentImage.image}
            alt={currentImage.caption || 'Sharh rasmi'}
            fill
            className="object-contain rounded-lg"
            sizes="(max-width: 1024px) 100vw, 896px"
            priority
          />
        </div>

        {currentImage.caption && (
          <p className="mt-3 text-sm text-center text-white/90 bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md max-w-lg">
            {currentImage.caption}
          </p>
        )}
      </div>
    </div>
  );
}
