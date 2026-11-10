'use client';

import React from 'react';
import { Star, MessageSquarePlus, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RatingStars } from './RatingStars';
import type { ProductRatingSummary } from '@/types/reviews';

interface RatingSummaryCardProps {
  summary: ProductRatingSummary | undefined;
  isLoading?: boolean;
  onOpenReviewModal: () => void;
  selectedRatingFilter?: number;
  onSelectRatingFilter?: (rating: number | undefined) => void;
}

export function RatingSummaryCard({
  summary,
  isLoading,
  onOpenReviewModal,
  selectedRatingFilter,
  onSelectRatingFilter,
}: RatingSummaryCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-card p-6 shadow-sm animate-pulse space-y-6">
        <div className="h-6 w-1/3 bg-muted rounded" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 h-24 bg-muted rounded-xl" />
          <div className="md:col-span-8 space-y-2">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  const totalReviews = summary?.total_reviews || 0;
  const avgRating = summary?.average_rating ? Number(summary.average_rating) : 0;

  // 1-5 yulduzlar taqsimoti
  const distribution = [
    { stars: 5, count: summary?.rating_5_count || 0 },
    { stars: 4, count: summary?.rating_4_count || 0 },
    { stars: 3, count: summary?.rating_3_count || 0 },
    { stars: 2, count: summary?.rating_2_count || 0 },
    { stars: 1, count: summary?.rating_1_count || 0 },
  ];

  // Ijobiy baholar (4 va 5 yulduzlar) foizi
  const positiveCount = (summary?.rating_5_count || 0) + (summary?.rating_4_count || 0);
  const positivePercentage = totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 100;

  return (
    <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Chap qism: Katta reyting bali va Yulduzlar */}
        <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left border-b lg:border-b-0 lg:border-r pb-6 lg:pb-0 lg:pr-8">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-black text-foreground tracking-tight">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-lg text-muted-foreground font-semibold">/ 5.0</span>
          </div>

          <div className="mt-2.5">
            <RatingStars rating={avgRating} size="lg" />
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {totalReviews > 0
              ? `${totalReviews} ta tasdiqlangan baholash asosida`
              : 'Hozircha sharhlar mavjud emas'}
          </p>

          {totalReviews > 0 && (
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="size-3.5 shrink-0" />
              <span>{positivePercentage}% xaridorlar mamnun qolishgan</span>
            </div>
          )}

          <div className="mt-6 w-full">
            <Button
              onClick={onOpenReviewModal}
              className="w-full gap-2 font-bold shadow-md cursor-pointer"
            >
              <MessageSquarePlus className="size-4" />
              Sharh qoldirish
            </Button>
          </div>
        </div>

        {/* O'ng qism: 1-5 yulduzlar taqsimoti progress barlari */}
        <div className="lg:col-span-8 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            <span>Reytinglar taqsimoti</span>
            {selectedRatingFilter && (
              <button
                type="button"
                onClick={() => onSelectRatingFilter?.(undefined)}
                className="text-primary hover:underline font-medium text-xs normal-case cursor-pointer"
              >
                Filtrni tozalash
              </button>
            )}
          </div>

          {distribution.map(({ stars, count }) => {
            const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            const isSelected = selectedRatingFilter === stars;

            return (
              <button
                key={stars}
                type="button"
                onClick={() => onSelectRatingFilter?.(isSelected ? undefined : stars)}
                className={`w-full group flex items-center gap-3 p-1.5 rounded-lg transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-primary/10 ring-1 ring-primary'
                    : 'hover:bg-muted/60'
                }`}
                title={`${stars} yulduzli sharhlarni ko'rsatish`}
              >
                {/* Yulduz nomi */}
                <div className="flex items-center gap-1 w-16 sm:w-20 text-xs font-medium text-muted-foreground group-hover:text-foreground">
                  <span>{stars}</span>
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                </div>

                {/* Progress bar yo'lakchasi */}
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSelected
                        ? 'bg-primary'
                        : stars >= 4
                        ? 'bg-amber-400 group-hover:bg-amber-500'
                        : stars === 3
                        ? 'bg-amber-300'
                        : 'bg-muted-foreground/40'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Foiz va soni */}
                <div className="w-16 text-right text-xs text-muted-foreground group-hover:text-foreground font-mono">
                  <span className="font-semibold">{percentage}%</span>{' '}
                  <span className="text-[11px] opacity-75">({count})</span>
                </div>
              </button>
            );
          })}

          <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Faqatgina buyurtmasi tasdiqlangan xaridorlar sharh qoldirishi mumkin.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
