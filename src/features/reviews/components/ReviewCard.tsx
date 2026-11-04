'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  Store,
  MoreVertical,
  Edit2,
  Trash2,
  MessageSquare,
  ImageIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { RatingStars } from './RatingStars';
import { useVoteReview } from '@/features/reviews/hooks/useReviews';
import { parseReviewError } from '@/features/reviews/api/reviewsApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { ReviewItem, ReviewImage } from '@/types/reviews';

interface ReviewCardProps {
  review: ReviewItem;
  productId: number;
  onEdit?: (review: ReviewItem) => void;
  onDelete?: (reviewId: number) => void;
  onReply?: (review: ReviewItem) => void;
  onOpenLightbox?: (images: ReviewImage[], initialIndex: number) => void;
}

export function ReviewCard({
  review,
  productId,
  onEdit,
  onDelete,
  onReply,
  onOpenLightbox,
}: ReviewCardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [showFullComment, setShowFullComment] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const voteMutation = useVoteReview();

  const isAuthor = Boolean(isAuthenticated && user && user.id === review.user?.id);
  const isStaffOrAdmin = Boolean(
    isAuthenticated &&
      user &&
      (user.role?.toLowerCase() === 'admin' || user.is_staff)
  );

  const handleVote = async (voteType: 'HELPFUL' | 'UNHELPFUL') => {
    if (!isAuthenticated) {
      toast.error('Ovoz berish uchun tizimga kirishingiz kerak');
      return;
    }

    try {
      await voteMutation.mutateAsync({
        reviewId: review.id,
        productId,
        voteType,
      });
    } catch (err) {
      toast.error(parseReviewError(err));
    }
  };

  // Sana formatlash
  const formattedDate = (() => {
    try {
      const d = new Date(review.created_at);
      return d.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return review.created_at;
    }
  })();

  // Foydalanuvchi initsiallari
  const initials = (() => {
    const name = review.user?.display_name || review.user?.first_name || 'Xaridor';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  })();

  const isLongComment = review.comment.length > 280;

  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm space-y-4 transition-shadow hover:shadow-md">
      {/* 1. Header: Muallif, reyting, sana va amallar menyusi */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="size-10 sm:size-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border shrink-0">
            {initials}
          </div>

          {/* Ism va tasdiqlangan xarid belgisi */}
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <span className="font-bold text-sm sm:text-base text-foreground">
                {review.user?.display_name || review.user?.first_name || 'Foydalanuvchi'}
              </span>

              {review.is_verified_purchase && (
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold gap-1 px-2 py-0.5"
                >
                  <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Xarid qilingan</span>
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <RatingStars rating={review.rating} size="sm" />
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Amallar menyusi (Muallif yoki Admin uchun) */}
        {(isAuthor || isStaffOrAdmin) && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Amallar menyusi"
            >
              <MoreVertical className="size-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border bg-popover p-1.5 shadow-lg z-30 animate-in fade-in zoom-in-95 text-xs">
                  {isAuthor && onEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(review);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-foreground hover:bg-muted transition-colors cursor-pointer text-left"
                    >
                      <Edit2 className="size-3.5 text-muted-foreground" />
                      <span>Tahrirlash</span>
                    </button>
                  )}

                  {isAuthor && onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(review.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors cursor-pointer text-left font-medium"
                    >
                      <Trash2 className="size-3.5" />
                      <span>O‘chirish</span>
                    </button>
                  )}

                  {isStaffOrAdmin && onReply && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onReply(review);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-primary hover:bg-primary/10 transition-colors cursor-pointer text-left font-medium border-t mt-1 pt-2"
                    >
                      <MessageSquare className="size-3.5" />
                      <span>{review.reply ? 'Javobni tahrirlash' : 'Javob qaytarish'}</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 2. Sharh Sarlavhasi */}
      {review.title && (
        <h4 className="text-base font-bold text-foreground tracking-tight">
          {review.title}
        </h4>
      )}

      {/* 3. Afzalliklari va Kamchiliklari (Pros / Cons) */}
      {(review.pros || review.cons) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {review.pros && (
            <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/50 space-y-0.5">
              <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <ThumbsUp className="size-3" />
                Afzalliklari:
              </span>
              <p className="text-foreground leading-relaxed">{review.pros}</p>
            </div>
          )}

          {review.cons && (
            <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/50 space-y-0.5">
              <span className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                <ThumbsDown className="size-3" />
                Kamchiliklari:
              </span>
              <p className="text-foreground leading-relaxed">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      {/* 4. Asosiy Matn */}
      <div className="text-sm text-foreground/90 leading-relaxed">
        <p>
          {isLongComment && !showFullComment
            ? `${review.comment.slice(0, 280)}...`
            : review.comment}
        </p>
        {isLongComment && (
          <button
            type="button"
            onClick={() => setShowFullComment(!showFullComment)}
            className="text-xs font-semibold text-primary hover:underline mt-1 cursor-pointer"
          >
            {showFullComment ? 'Qisqartirish' : 'Batafsil o‘qish'}
          </button>
        )}
      </div>

      {/* 5. Biriktirilgan Rasmlar Galereyasi */}
      {review.images && review.images.length > 0 && (
        <div className="pt-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {review.images.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => onOpenLightbox?.(review.images, idx)}
                className="group relative size-20 sm:size-24 rounded-xl overflow-hidden border bg-muted shrink-0 transition-transform hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                title={img.caption || 'Rasmni kattalashtirish'}
              >
                <Image
                  src={img.image}
                  alt={img.caption || 'Sharh rasmi'}
                  fill
                  className="object-cover group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ImageIcon className="size-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. Pastki qism: Foydali / Foydasiz ovoz berish */}
      <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
        <span className="text-xs">Ushbu sharh foydali bo‘ldimi?</span>

        <div className="flex items-center gap-2">
          {/* Helpful (Like) */}
          <button
            type="button"
            onClick={() => handleVote('HELPFUL')}
            disabled={voteMutation.isPending}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              review.user_vote === 'HELPFUL'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
            title="Foydali deb ovoz berish"
          >
            <ThumbsUp
              className={`size-3.5 ${
                review.user_vote === 'HELPFUL'
                  ? 'fill-emerald-600 text-emerald-600 dark:fill-emerald-400'
                  : ''
              }`}
            />
            <span>{review.likes_count || 0}</span>
          </button>

          {/* Unhelpful (Dislike) */}
          <button
            type="button"
            onClick={() => handleVote('UNHELPFUL')}
            disabled={voteMutation.isPending}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              review.user_vote === 'UNHELPFUL'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 font-bold'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
            title="Foydasiz deb ovoz berish"
          >
            <ThumbsDown
              className={`size-3.5 ${
                review.user_vote === 'UNHELPFUL'
                  ? 'fill-rose-600 text-rose-600 dark:fill-rose-400'
                  : ''
              }`}
            />
            <span>{review.dislikes_count || 0}</span>
          </button>
        </div>
      </div>

      {/* 7. Do'konning Rasmiy Javobi (Official Store Reply) */}
      {review.reply && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2 relative">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-primary">
              <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Store className="size-3.5" />
              </div>
              <span>Do‘konning rasmiy javobi</span>
              <span className="text-[11px] font-normal text-muted-foreground">
                ({review.reply.user_name || 'Admin'})
              </span>
            </div>

            <span className="text-[11px] text-muted-foreground">
              {(() => {
                try {
                  return new Date(review.reply.created_at).toLocaleDateString('uz-UZ', {
                    month: 'short',
                    day: 'numeric',
                  });
                } catch {
                  return '';
                }
              })()}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-foreground/90 pl-8 leading-relaxed">
            {review.reply.comment}
          </p>
        </div>
      )}
    </div>
  );
}
