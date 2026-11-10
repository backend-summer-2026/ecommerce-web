'use client';

import React from 'react';
import { Star, CheckCircle2, ArrowUpDown, FilterX } from 'lucide-react';
import type { ReviewFilterParams } from '@/types/reviews';

interface ReviewFiltersProps {
  filters: ReviewFilterParams;
  onChange: (newFilters: ReviewFilterParams) => void;
  totalCount?: number;
}

const sortOptions = [
  { value: '-created_at', label: 'Eng yangi sharhlar' },
  { value: '-likes_count', label: 'Eng foydali sharhlar' },
  { value: '-rating', label: 'Eng yuqori baholi' },
  { value: 'rating', label: 'Eng past baholi' },
];

export function ReviewFilters({ filters, onChange, totalCount }: ReviewFiltersProps) {
  const currentRating = filters.rating;
  const isVerifiedOnly = Boolean(filters.verified_only);
  const currentOrdering = filters.ordering || '-created_at';

  const hasActiveFilters = Boolean(currentRating || isVerifiedOnly || filters.ordering);

  const handleRatingClick = (ratingValue: number | undefined) => {
    onChange({
      ...filters,
      rating: currentRating === ratingValue ? undefined : ratingValue,
      page: 1,
    });
  };

  const handleVerifiedToggle = () => {
    onChange({
      ...filters,
      verified_only: !isVerifiedOnly ? true : undefined,
      page: 1,
    });
  };

  const handleSortChange = (ordering: string) => {
    onChange({
      ...filters,
      ordering,
      page: 1,
    });
  };

  const handleReset = () => {
    onChange({
      page: 1,
      page_size: filters.page_size,
    });
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Chap qism: Yulduzlar chip filtrlari */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleRatingClick(undefined)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              !currentRating
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
          >
            Barchasi {totalCount !== undefined ? `(${totalCount})` : ''}
          </button>

          {[5, 4, 3, 2, 1].map((stars) => {
            const isSelected = currentRating === stars;
            return (
              <button
                key={stars}
                type="button"
                onClick={() => handleRatingClick(stars)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                <span>{stars}</span>
                <Star className="size-3 fill-current" />
              </button>
            );
          })}
        </div>

        {/* O'ng qism: Saralash va Tasdiqlangan xarid filtri */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Faqat xarid qilganlar */}
          <button
            type="button"
            onClick={handleVerifiedToggle}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isVerifiedOnly
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold'
                : 'border-border bg-background hover:bg-muted text-muted-foreground'
            }`}
          >
            <CheckCircle2 className={`size-3.5 ${isVerifiedOnly ? 'text-emerald-600' : 'text-muted-foreground'}`} />
            <span>Faqat xaridorlar</span>
          </button>

          {/* Saralash tanlagichi */}
          <div className="relative inline-flex items-center">
            <ArrowUpDown className="size-3.5 absolute left-2.5 text-muted-foreground pointer-events-none" />
            <select
              value={currentOrdering}
              onChange={(e) => handleSortChange(e.target.value)}
              className="pl-8 pr-4 py-1.5 text-xs font-medium rounded-lg border bg-background text-foreground hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-colors"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtrlarni tozalash */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              title="Filtrlarni tozalash"
            >
              <FilterX className="size-3.5" />
              <span className="hidden sm:inline">Tozalash</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
