'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCancelPayment } from '@/features/payments/hooks/usePayments';
import { parsePaymentError } from '@/features/payments/api/paymentsApi';

interface CancelPaymentModalProps {
  paymentNumber: string;
  isOpen: boolean;
  onClose: () => void;
  onCancelled?: () => void;
}

const PRESET_REASONS = [
  'To‘lov usulini o‘zgartirmoqchiman',
  'Mablag‘ yetarli emasligi tufayli',
  'Boshqa karta orqali to‘lamoqchiman',
  'Fikrim o‘zgardi',
  'Boshqa sabab',
];

export function CancelPaymentModal({
  paymentNumber,
  isOpen,
  onClose,
  onCancelled,
}: CancelPaymentModalProps) {
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const cancelPaymentMutation = useCancelPayment();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    const finalReason =
      selectedReason === 'Boshqa sabab'
        ? customReason.trim() || 'Mijoz tomonidan bekor qilindi'
        : selectedReason;

    try {
      await cancelPaymentMutation.mutateAsync({
        payment_number: paymentNumber,
        reason: finalReason,
      });
      toast.success('To‘lov urinishi bekor qilindi');
      onClose();
      if (onCancelled) onCancelled();
    } catch (err) {
      toast.error(parsePaymentError(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl border bg-background p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                To‘lovni bekor qilish
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                #{paymentNumber}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full size-8"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Ushbu to‘lov urinishini bekor qilmoqchimisiz? Sababini tanlang:
          </p>

          <div className="space-y-2">
            {PRESET_REASONS.map((r) => (
              <label
                key={r}
                className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                  selectedReason === r
                    ? 'border-primary bg-primary/5 font-semibold text-foreground'
                    : 'border-border hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                <input
                  type="radio"
                  name="payment_cancel_reason"
                  checked={selectedReason === r}
                  onChange={() => setSelectedReason(r)}
                  className="accent-primary size-4"
                />
                <span>{r}</span>
              </label>
            ))}
          </div>

          {selectedReason === 'Boshqa sabab' && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Bekor qilish sababini batafsil yozing..."
              className="w-full h-20 rounded-xl border border-input bg-background p-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={cancelPaymentMutation.isPending}
            >
              Ortga
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirm}
              disabled={cancelPaymentMutation.isPending}
              className="gap-2 font-semibold"
            >
              {cancelPaymentMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Bekor qilinmoqda...</span>
                </>
              ) : (
                <span>Bekor qilish</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
