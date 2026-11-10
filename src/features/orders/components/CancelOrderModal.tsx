'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCancelOrder } from '@/features/orders/hooks/useOrders';
import { parseOrderError } from '@/features/orders/api/ordersApi';

interface CancelOrderModalProps {
  orderNumber: string;
  isOpen: boolean;
  onClose: () => void;
  onCancelled?: () => void;
}

const PRESET_REASONS = [
  'Fikrim o‘zgardi (xarid qilishni xohlamayman)',
  'Boshqa manzil yoki telefon raqamiga buyurtma bermoqchiman',
  'Xato tovar yoki variant tanlagan edim',
  'Yetkazib berish muddati uzoq tuyuldi',
  'Boshqa sabab',
];

export function CancelOrderModal({
  orderNumber,
  isOpen,
  onClose,
  onCancelled,
}: CancelOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const cancelOrderMutation = useCancelOrder();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    const finalReason =
      selectedReason === 'Boshqa sabab'
        ? customReason.trim() || 'Mijoz tomonidan bekor qilindi'
        : selectedReason;

    try {
      await cancelOrderMutation.mutateAsync({
        orderNumber,
        reason: finalReason,
      });
      toast.success('Buyurtma muvaffaqiyatli bekor qilindi');
      onClose();
      if (onCancelled) onCancelled();
    } catch (err) {
      toast.error(parseOrderError(err));
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
              <h3 className="font-bold text-base text-foreground">Buyurtmani bekor qilish</h3>
              <p className="text-xs text-muted-foreground font-mono">#{orderNumber}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="py-4 space-y-4 text-sm">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Haqiqatan ham ushbu buyurtmani bekor qilmoqchimisiz? Bekor qilingach, tovarlar omborga
            qaytariladi va jarayon to‘xtatiladi.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Bekor qilish sababi:</label>
            <div className="space-y-1.5">
              {PRESET_REASONS.map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50 cursor-pointer text-xs"
                >
                  <input
                    type="radio"
                    name="cancel_reason"
                    value={r}
                    checked={selectedReason === r}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="accent-primary"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedReason === 'Boshqa sabab' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Sababni yozing:</label>
              <textarea
                rows={3}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Iltimos, bekor qilish sababini batafsilroq yozing..."
                className="w-full rounded-lg border bg-background p-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={cancelOrderMutation.isPending}
            className="cursor-pointer"
          >
            Yo‘q, qolsin
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={cancelOrderMutation.isPending}
            className="gap-2 cursor-pointer font-semibold"
          >
            {cancelOrderMutation.isPending && <Loader2 className="size-4 animate-spin" />}
            <span>Ha, bekor qilish</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
