'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useDeleteReview } from '@/features/reviews/hooks/useReviews';
import { parseReviewError } from '@/features/reviews/api/reviewsApi';

interface DeleteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: number | null;
  productId?: number;
}

export function DeleteReviewModal({
  isOpen,
  onClose,
  reviewId,
  productId,
}: DeleteReviewModalProps) {
  const deleteMutation = useDeleteReview();

  if (!isOpen || !reviewId) return null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        reviewId,
        productId,
      });
      toast.success('Sharh muvaffaqiyatli o‘chirildi');
      onClose();
    } catch (error) {
      toast.error(parseReviewError(error));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-card border p-6 shadow-xl space-y-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertTriangle className="size-6" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-foreground">
            Sharhni o‘chirmoqchimisiz?
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ushbu amalni ortga qaytarib bo‘lmaydi. Sharhingiz va unga biriktirilgan barcha rasmlar butunlay o‘chiriladi.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="cursor-pointer"
          >
            Bekor qilish
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="gap-2 cursor-pointer"
          >
            {deleteMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            <span>O‘chirish</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
