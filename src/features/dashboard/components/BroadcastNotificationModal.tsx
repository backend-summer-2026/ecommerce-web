'use client';

import React, { useState } from 'react';
import { X, Send, Radio, ArrowRight, Loader2, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBroadcastNotification } from '../hooks/useDashboard';
import { toast } from 'sonner';

interface BroadcastNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BroadcastNotificationModal({
  isOpen,
  onClose,
}: BroadcastNotificationModalProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'SYSTEM' | 'PROMOTION' | 'ORDER' | 'PAYMENT'>('SYSTEM');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [actionUrl, setActionUrl] = useState('');
  const [recipientType, setRecipientType] = useState<'ALL' | 'STAFF'>('ALL');

  const broadcastMutation = useBroadcastNotification();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Sarlavha va xabar matnini kiriting');
      return;
    }

    try {
      await broadcastMutation.mutateAsync({
        title: title.trim(),
        message: message.trim(),
        notification_type: type,
        priority: priority,
        action_url: actionUrl.trim() || undefined,
        recipient_type: recipientType,
        broadcast: true,
      });
      setTitle('');
      setMessage('');
      setActionUrl('');
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
          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Megaphone className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Ommaviy Bildirishnoma (Broadcast)</h2>
            <p className="text-xs text-muted-foreground">
              Barcha faol mijozlar yoki xodimlarga In-App xabar tarqatish
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1.5 block">Qabul qiluvchilar auditoriyasi</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={recipientType === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRecipientType('ALL')}
                className="text-xs font-medium"
              >
                Barcha Foydalanuvchilar (ALL)
              </Button>
              <Button
                type="button"
                variant={recipientType === 'STAFF' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRecipientType('STAFF')}
                className="text-xs font-medium"
              >
                Faqat Xodimlar (Staff)
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block">Xabarnoma Sarlavhasi</label>
            <Input
              placeholder="Masalan: Saytda rejalashtirilgan yangilanishlar"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs font-semibold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block">Xabar Matni</label>
            <textarea
              rows={3}
              placeholder="Foydalanuvchilarga ko'rinadigan to'liq xabar..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block">Toifasi</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="SYSTEM">SYSTEM - Tizim e'loni</option>
                <option value="PROMOTION">PROMOTION - Aksiya va Chegirma</option>
                <option value="ORDER">ORDER - Buyurtmalar</option>
                <option value="PAYMENT">PAYMENT - To'lovlar</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1.5 block">Muhimlik Darajasi</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="NORMAL">NORMAL - Oddiy</option>
                <option value="HIGH">HIGH - Yuqori</option>
                <option value="URGENT">URGENT - Shoshilinch</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block">
              O'tish Havolasi (Action URL - Ixtiyoriy)
            </label>
            <Input
              placeholder="Masalan: /catalog yoki /promotions"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={broadcastMutation.isPending || !title.trim() || !message.trim()}
              className="gap-2 font-semibold"
            >
              {broadcastMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Yuborilmoqda...</span>
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  <span>Tarqatishni Boshlash</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
