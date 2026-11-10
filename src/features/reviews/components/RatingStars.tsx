'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number; // 0 dan 5 gacha
  maxRating?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  showScore?: boolean;
  scoreClassName?: string;
  className?: string;
}

const sizeMap = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-8',
};

const ratingLabels: Record<number, string> = {
  1: 'Juda yomon',
  2: 'Qoniqarsiz',
  3: 'O‘rtacha',
  4: 'Yaxshi',
  5: 'A‘lo darajada!',
};

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showScore = false,
  scoreClassName = 'text-sm font-semibold',
  className = '',
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = interactive && hoverRating !== null ? hoverRating : rating;
  const starSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => interactive && setHoverRating(null)}
      >
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = displayRating >= starValue;
          const isHalf = !isFilled && displayRating >= starValue - 0.5;

          if (interactive) {
            return (
              <button
                key={starValue}
                type="button"
                onClick={() => onRatingChange?.(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                className="p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded cursor-pointer"
                aria-label={`${starValue} yulduz: ${ratingLabels[starValue] || ''}`}
              >
                <Star
                  className={`${starSize} transition-colors ${
                    isFilled
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30 hover:text-amber-300'
                  }`}
                />
              </button>
            );
          }

          return (
            <div key={starValue} className="relative">
              {isHalf ? (
                <div className="relative">
                  <Star className={`${starSize} text-muted-foreground/30`} />
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Star className={`${starSize} fill-amber-400 text-amber-400`} />
                  </div>
                </div>
              ) : (
                <Star
                  className={`${starSize} ${
                    isFilled
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {interactive && displayRating > 0 && (
        <span className="text-xs font-medium text-amber-600 dark:text-amber-400 ml-1">
          {ratingLabels[displayRating] || ''}
        </span>
      )}

      {showScore && !interactive && (
        <span className={scoreClassName}>
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
}
