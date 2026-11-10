'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardCustomerListItem } from '@/types';
import { useToggleCustomerStatus } from '../hooks/useDashboard';

interface ToggleCustomerStatusModalProps {
  customer: DashboardCustomerListItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ToggleCustomerStatusModal({
  customer,
  isOpen,
  onClose,
}: ToggleCustomerStatusModalProps) {
  const [reason, setReason] = useState('');
  const toggleMutation = useToggleCustomerStatus();

  if (!isOpen || !customer) return null;

  const isBlocking = customer.is_active;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await toggleMutation.mutateAsync({
        id: customer.id,
        payload: {
          is_active: !isBlocking,
          reason: reason.trim() || undefined,
        },
      });
      setReason('');
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
          <div
            className={`size-10 rounded-lg flex items-center justify-center ${
              isBlocking ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-600'
            }`}
          >
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {isBlocking ? 'Mijozni Bloklash' : 'Mijozni Qayta Faollashtirish'}
            </h2>
            <p className="text-xs text-muted-foreground">{customer.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isBlocking
              ? 'Haqiqatan ham ushbu foydalanuvchini bloklamoqchimisiz? Bloklangan mijoz saytga kira olmaydi va xarid qila olmaydi.'
              : 'Ushbu mijoz hisobini faollashtirmoqchimisiz? Foydalanuvchi tizimdan to\'liq foydalanishi mumkin bo\'ladi.'}
          </p>

          <div>
            <label className="text-xs font-semibold mb-1.5 block">
              Sabab yoki asoslovchi izoh (Ixtiyoriy)
            </label>
            <Input
              placeholder={isBlocking ? "Masalan: Firibgarlik yoki shubhali harakat" : "Masalan: Muammo bartaraf etildi"}
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
              variant={isBlocking ? 'destructive' : 'default'}
              size="sm"
              disabled={toggleMutation.isPending}
              className="gap-2 font-semibold"
            >
              {toggleMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Saqlanmoqda...</span>
                </>
              ) : (
                <>
                  <span>{isBlocking ? 'Bloklashni tasdiqlash' : 'Faollashtirish'}</span>
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
