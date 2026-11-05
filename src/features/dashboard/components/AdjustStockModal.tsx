'use client';

import React, { useState } from 'react';
import { X, Package, ArrowRight, Loader2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DashboardInventoryItem, StockMovementType } from '@/types';
import { useAdjustStock } from '../hooks/useDashboard';
import { toast } from 'sonner';

interface AdjustStockModalProps {
  item: DashboardInventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AdjustStockModal({ item, isOpen, onClose }: AdjustStockModalProps) {
  const [delta, setDelta] = useState<number>(1);
  const [isPositive, setIsPositive] = useState<boolean>(true);
  const [movementType, setMovementType] = useState<StockMovementType>('INCOMING');
  const [reason, setReason] = useState<string>('');

  const adjustStockMutation = useAdjustStock();

  if (!isOpen || !item) return null;

  const currentAvailable = item.available_quantity ?? item.quantity ?? 0;
  const effectiveDelta = isPositive ? Math.abs(delta) : -Math.abs(delta);
  const resultingStock = currentAvailable + effectiveDelta;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (effectiveDelta === 0) {
      toast.error("O'zgarish miqdori 0 bo'lishi mumkin emas");
      return;
    }
    if (resultingStock < 0) {
      toast.error("Natijaviy qoldiq 0 dan kam bo'lishi mumkin emas");
      return;
    }

    try {
      await adjustStockMutation.mutateAsync({
        variantId: item.variant_id || item.id,
        payload: {
          quantity_delta: effectiveDelta,
          movement_type: movementType,
          reason: reason.trim() || undefined,
        },
      });
      onClose();
    } catch {
      // Handled in mutation onError
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
          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Package className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Ombor Qoldig'ini O'zgartirish</h2>
            <p className="text-xs text-muted-foreground">
              Zaxiraga kirim, chiqim yoki inventarizatsiya tuzatishini kiritish
            </p>
          </div>
        </div>

        {/* Variant Info */}
        <div className="my-4 p-3 rounded-lg bg-muted/40 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mahsulot:</span>
            <span className="font-semibold text-foreground">{item.product_name}</span>
          </div>
          <div className="flex justify-between font-mono">
            <span className="text-muted-foreground">SKU:</span>
            <span>{item.sku}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mavjud zaxira:</span>
            <Badge variant="outline" className="font-bold">
              {currentAvailable} dona
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kirim / Chiqim Tanlagich */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block">Harakat yo'nalishi</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={isPositive ? 'default' : 'outline'}
                size="sm"
                className="gap-1.5 font-medium"
                onClick={() => {
                  setIsPositive(true);
                  setMovementType('INCOMING');
                }}
              >
                <Plus className="size-3.5" />
                <span>Kirim (+ Qoldiq oshadi)</span>
              </Button>
              <Button
                type="button"
                variant={!isPositive ? 'destructive' : 'outline'}
                size="sm"
                className="gap-1.5 font-medium"
                onClick={() => {
                  setIsPositive(false);
                  setMovementType('OUTGOING');
                }}
              >
                <Minus className="size-3.5" />
                <span>Chiqim (- Qoldiq kamayadi)</span>
              </Button>
            </div>
          </div>

          {/* Miqdor inputi */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block">
              O'zgarish Miqdori (Dona)
            </label>
            <Input
              type="number"
              min={1}
              value={delta}
              onChange={(e) => setDelta(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-base font-semibold"
              required
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Yangi natijaviy qoldiq:{' '}
              <span className={`font-bold ${resultingStock < 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                {resultingStock} dona
              </span>
            </p>
          </div>

          {/* Harakat turi dropdown */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block">Harakat tasnifi (Movement Type)</label>
            <select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value as StockMovementType)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="INCOMING">INCOMING - Yangi partiya kirimi</option>
              <option value="OUTGOING">OUTGOING - Chiqim / Sotuv</option>
              <option value="ADJUSTMENT">ADJUSTMENT - Qo'lda inventarizatsiya tuzatishi</option>
              <option value="RETURN">RETURN - Mijoz qaytargan tovar</option>
              <option value="DAMAGED">DAMAGED - Yaroqsiz / Brak holati</option>
            </select>
          </div>

          {/* Sabab inputi */}
          <div>
            <label className="text-xs font-semibold mb-1.5 block">
              Izoh yoki asoslovchi hujjat (Ixtiyoriy)
            </label>
            <Input
              placeholder="Masalan: Invoys #9928 bo'yicha kirim yoki inventarizatsiya tafovuti"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={adjustStockMutation.isPending || resultingStock < 0}
              className="gap-2 font-semibold"
            >
              {adjustStockMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Saqlanmoqda...</span>
                </>
              ) : (
                <>
                  <span>Tasdiqlash</span>
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
