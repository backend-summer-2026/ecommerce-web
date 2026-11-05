'use client';

import React, { useState } from 'react';
import { X, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewItem } from '@/types/reviews';
import { useReviewReply } from '../hooks/useDashboard';
import { toast } from 'sonner';

interface ReviewOfficialReplyModalProps {
  review: ReviewItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewOfficialReplyModal({
  review,
  isOpen,
  onClose,
}: ReviewOfficialReplyModalProps) {
  const [replyText, setReplyText] = useState('');
  const replyMutation = useReviewReply();

  if (!isOpen || !review) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error('Javob matnini kiriting');
      return;
    }

    try {
      await replyMutation.mutateAsync({
        id: review.id,
        payload: { reply: replyText.trim() },
      });
      setReplyText('');
      onClose();
    } catch {
      // Handled in mutation
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-xl border bg-card p-6 shadow-xl animate-in fade-in-50 zoom-in-95">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3 border-b pb-4">
          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <MessageSquare className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Rasmiy Javob Qaytarish</h2>
            <p className="text-xs text-muted-foreground">
              Do'kon administratsiyasi nomidan sharhga javob
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 rounded-lg bg-muted/30 border text-xs">
            <span className="font-semibold text-foreground">
              {review.user?.display_name || review.user?.first_name || 'Mijoz'}:
            </span>{' '}
            <span className="text-muted-foreground">{review.comment}</span>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block">
              Rasmiy Javob Matni
            </label>
            <textarea
              rows={4}
              placeholder="Hurmatli mijoz, fikringiz uchun tashakkur! Biz har bir mulohazani inobatga olamiz..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={replyMutation.isPending || !replyText.trim()}
              className="gap-2 font-semibold"
            >
              {replyMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Yuborilmoqda...</span>
                </>
              ) : (
                <>
                  <span>Javobni Yuborish</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
