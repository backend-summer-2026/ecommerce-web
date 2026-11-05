'use client';

import React, { useState } from 'react';
import { X, RotateCcw, ArrowRight, Loader2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminPaymentListItem } from '@/types';
import { useIssueRefund } from '../hooks/useDashboard';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

interface IssueRefundModalProps {
  payment: AdminPaymentListItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function IssueRefundModal({ payment, isOpen, onClose }: IssueRefundModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [providerRefundId, setProviderRefundId] = useState<string>('');

  const refundMutation = useIssueRefund();

  if (!isOpen || !payment) return null;

  const originalAmount = Number(payment.amount || 0);

  const handleSetFullRefund = () => {
    setAmount(payment.amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Noto'g'ri qaytarish summasi kiritildi");
      return;
    }
    if (numericAmount > originalAmount) {
      toast.error("Qaytarish summasi to'lov miqdoridan oshib ketishi mumkin emas");
      return;
    }

    try {
      await refundMutation.mutateAsync({
        paymentNumber: payment.payment_number,
        payload: {
          amount: numericAmount.toFixed(2),
          reason: reason.trim() || undefined,
          provider_refund_id: providerRefundId.trim() || undefined,
        },
      });
      setAmount('');
      setReason('');
      setProviderRefundId('');
      onClose();
    } catch {
      // Handled by mutation
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
          <div className="size-10 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center">
            <RotateCcw className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Mablag'ni Qaytarish (Issue Refund)</h2>
            <p className="text-xs text-muted-foreground font-mono">
              To'lov: {payment.payment_number} ({payment.provider_display})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* To'lov ma'lumoti */}
          <div className="p-3 rounded-lg bg-muted/30 border text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Buyurtma:</span>
              <span className="font-mono font-semibold">{payment.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Asl to'lov summasi:</span>
              <span className="font-bold text-foreground">
                {formatPrice(originalAmount, { currency: 'UZS' })}
              </span>
            </div>
          </div>

          {/* Summa kiritish */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold">Qaytariladigan Summa (UZS)</label>
              <button
                type="button"
                onClick={handleSetFullRefund}
                className="text-[11px] text-primary hover:underline font-semibold"
              >
                To'liq qaytarish
              </button>
            </div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                type="number"
                step="any"
                min="1"
                max={originalAmount}
                placeholder="Masalan: 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9 font-semibold text-sm"
                required
              />
            </div>
          </div>

          {/* Sababi */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block">Qaytarish Sababi</label>
            <Input
              placeholder="Masalan: Mahsulot qaytarildi yoki bekor qilingan buyurtma"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="text-xs"
              required
            />
          </div>

          {/* Provider refund id */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block">
              Gateway Refund ID (Ixtiyoriy)
            </label>
            <Input
              placeholder="Masalan: REF_CLICK_9921 yoki Payme tranzaksiya raqami"
              value={providerRefundId}
              onChange={(e) => setProviderRefundId(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={refundMutation.isPending || !amount}
              className="gap-2 font-semibold"
            >
              {refundMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Qaytarilmoqda...</span>
                </>
              ) : (
                <>
                  <span>Refund Tasdiqlash</span>
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
