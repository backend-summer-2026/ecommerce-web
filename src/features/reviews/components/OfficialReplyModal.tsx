'use client';

import React, { useState } from 'react';
import { X, MessageSquare, Loader2, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useReplyReview } from '@/features/reviews/hooks/useReviews';
import { parseReviewError } from '@/features/reviews/api/reviewsApi';

interface OfficialReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: number | null;
  productId?: number;
  initialComment?: string;
  reviewerName?: string;
}

interface InnerReplyFormProps {
  onClose: () => void;
  reviewId: number;
  productId?: number;
  initialComment?: string;
  reviewerName?: string;
}

function InnerReplyForm({
  onClose,
  reviewId,
  productId,
  initialComment = '',
  reviewerName,
}: InnerReplyFormProps) {
  const [comment, setComment] = useState(initialComment);
  const replyMutation = useReplyReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Iltimos, rasmiy javob matnini kiriting');
      return;
    }

    try {
      await replyMutation.mutateAsync({
        reviewId,
        productId,
        data: { comment: comment.trim() },
      });
      toast.success('Rasmiy javob muvaffaqiyatli saqlandi');
      onClose();
    } catch (error) {
      toast.error(parseReviewError(error));
    }
  };

  return (
    <div
      className="w-full max-w-lg rounded-2xl bg-card border p-6 shadow-xl space-y-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Store className="size-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Rasmiy do‘kon javobi
            </h3>
            {reviewerName && (
              <p className="text-xs text-muted-foreground">
                Mijoz: <span className="font-semibold">{reviewerName}</span>
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            Do‘kon nomidan javob matni:
          </label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Xaridingiz uchun tashakkur! Savolingiz yoki taklifingiz yuzasidan..."
            className="w-full rounded-xl border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={replyMutation.isPending}
            className="cursor-pointer"
          >
            Bekor qilish
          </Button>

          <Button
            type="submit"
            disabled={replyMutation.isPending || !comment.trim()}
            className="gap-2 cursor-pointer"
          >
            {replyMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            <MessageSquare className="size-4" />
            <span>Javobni chop etish</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

export function OfficialReplyModal({
  isOpen,
  onClose,
  reviewId,
  productId,
  initialComment = '',
  reviewerName,
}: OfficialReplyModalProps) {
  if (!isOpen || !reviewId) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onClose}
    >
      <InnerReplyForm
        key={`${reviewId}-${initialComment}`}
        onClose={onClose}
        reviewId={reviewId}
        productId={productId}
        initialComment={initialComment}
        reviewerName={reviewerName}
      />
    </div>
  );
}
