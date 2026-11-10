'use client';

import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight, Loader2, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OrderStatus } from '@/types/orders';
import { useUpdateOrderStatus } from '../hooks/useDashboard';

interface OrderStatusUpdateModalProps {
  orderNumber: string | null;
  currentStatus?: OrderStatus;
  currentTracking?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderStatusUpdateModal({
  orderNumber,
  currentStatus = 'PENDING',
  currentTracking = '',
  isOpen,
  onClose,
}: OrderStatusUpdateModalProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState<string>(currentTracking || '');
  const [adminNotes, setAdminNotes] = useState<string>('');

  const updateMutation = useUpdateOrderStatus();

  if (!isOpen || !orderNumber) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        orderNumber,
        payload: {
          status,
          new_status: status,
          comment: adminNotes.trim() || undefined,
          tracking_number: trackingNumber.trim() || undefined,
          admin_notes: adminNotes.trim() || undefined,
        },
      });
      onClose();
    } catch {
      // Error handled by mutation
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
            <CheckCircle className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Buyurtma Statusini Yangilash</h2>
            <p className="text-xs font-mono text-muted-foreground">{orderNumber}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1.5 block">Yangi Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            >
              <option value="PENDING">PENDING - Kutilmoqda</option>
              <option value="CONFIRMED">CONFIRMED - Tasdiqlandi</option>
              <option value="PROCESSING">PROCESSING - Yig'ilmoqda / Qadoqlanmoqda</option>
              <option value="SHIPPED">SHIPPED - Kuryerga berildi (Yo'lda)</option>
              <option value="DELIVERED">DELIVERED - Mijozga yetkazib berildi</option>
              <option value="CANCELLED">CANCELLED - Bekor qilindi</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block flex items-center gap-1.5">
              <Truck className="size-3.5 text-muted-foreground" />
              <span>Kuryer / Trek-raqami (Tracking Code)</span>
            </label>
            <Input
              placeholder="Masalan: UZEX-20261105-8841"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="text-xs font-mono"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Mijoz o'z shaxsiy kabinetida tracking timeline orqali kuzatishi mumkin.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block">
              Ichki operator izohi (Ixtiyoriy)
            </label>
            <textarea
              rows={2}
              placeholder="Masalan: Kuryer topshirildi, soat 17:00 da yetib boradi"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={updateMutation.isPending}
              className="gap-2 font-semibold"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Yangilanmoqda...</span>
                </>
              ) : (
                <>
                  <span>Statusni Saqlash</span>
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
