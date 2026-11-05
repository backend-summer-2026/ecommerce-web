'use client';

import React, { useState } from 'react';
import { X, Star, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReviewItem } from '@/types/reviews';
import { useModerateReview } from '../hooks/useDashboard';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';

interface ModerateReviewModalProps {
  review: ReviewItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ModerateReviewModal({ review, isOpen, onClose }: ModerateReviewModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const moderateMutation = useModerateReview();

  if (!isOpen || !review) return null;

  const handleApprove = async () => {
    try {
      await moderateMutation.mutateAsync({
        id: review.id,
        payload: {
          status: 'APPROVED',
          rejection_reason: '',
        },
      });
      onClose();
    } catch {
      // Handled by mutation
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await moderateMutation.mutateAsync({
        id: review.id,
        payload: {
          status: 'REJECTED',
          rejection_reason: rejectionReason.trim(),
        },
      });
      setIsRejecting(false);
      setRejectionReason('');
      onClose();
    } catch {
      // Handled by mutation
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl animate-in fade-in-50 zoom-in-95">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3 border-b pb-4">
          <div className="size-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Star className="size-5 fill-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Sharh Moderatsiyasi</h2>
            <p className="text-xs text-muted-foreground">
              {review.user?.display_name || review.user?.first_name || 'Mijoz'} • {formatDate(review.created_at)}
            </p>
          </div>
        </div>

        {/* Sharh Kontenti */}
        <div className="my-4 space-y-3">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-4 ${
                  i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'
                }`}
              />
            ))}
            <span className="text-xs font-bold ml-1">{review.rating} / 5</span>
          </div>

          {review.title && (
            <h4 className="font-semibold text-sm text-foreground">{review.title}</h4>
          )}

          <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border">
            {review.comment}
          </p>

          {/* Rasmlar bo'lsa */}
          {review.images && review.images.length > 0 && (
            <div className="flex items-center gap-2 pt-1 overflow-x-auto">
              {review.images.map((img) => (
                <div key={img.id} className="relative size-16 rounded-md overflow-hidden border shrink-0">
                  <Image
                    src={img.image}
                    alt="Review image"
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rad etish sababi formasi */}
        {isRejecting ? (
          <form onSubmit={handleReject} className="space-y-3 border-t pt-4">
            <div>
              <label className="text-xs font-semibold mb-1 block">
                Rad etish sababi (Mijozga bildirish uchun)
              </label>
              <Input
                placeholder="Masalan: Nomaqbul so'zlar yoki qoidalarga zid rasm"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="text-xs"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRejecting(false)}
              >
                Ortga
              </Button>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={moderateMutation.isPending || !rejectionReason.trim()}
              >
                {moderateMutation.isPending ? 'Saqlanmoqda...' : 'Rad etishni tasdiqlash'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between border-t pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Yopish
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setIsRejecting(true)}
                className="gap-1.5"
              >
                <XCircle className="size-4" />
                <span>Rad etish</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApprove}
                disabled={moderateMutation.isPending}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {moderateMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle className="size-4" />
                )}
                <span>Tasdiqlash (Approve)</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
