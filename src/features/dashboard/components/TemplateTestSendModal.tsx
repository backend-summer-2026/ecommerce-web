'use client';

import React, { useState } from 'react';
import { X, Send, ArrowRight, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationTemplate } from '@/types';
import { useTestSendTemplate } from '../hooks/useDashboard';
import { toast } from 'sonner';

interface TemplateTestSendModalProps {
  template: NotificationTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateTestSendModal({
  template,
  isOpen,
  onClose,
}: TemplateTestSendModalProps) {
  const [email, setEmail] = useState('');
  const testSendMutation = useTestSendTemplate();

  if (!isOpen || !template) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Sinov email manzilini kiriting');
      return;
    }

    try {
      await testSendMutation.mutateAsync({
        code: template.code,
        payload: {
          test_email: email.trim(),
          send_email: true,
          context_data: {
            customer_name: 'Test Administrator',
            order_number: 'ORD-TEST-9999',
          },
        },
      });
      setEmail('');
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
            <Mail className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Shablonni Sinab Ko'rish</h2>
            <p className="text-xs text-muted-foreground font-mono">{template.code}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 rounded-lg bg-muted/30 border text-xs space-y-1">
            <p className="font-semibold text-foreground">{template.name}</p>
            <p className="text-muted-foreground">{template.description || 'Shablon tavsifi yo\'q'}</p>
            {template.email_subject_template && (
              <p className="text-[11px] font-mono text-primary mt-1">
                Mavzu: {template.email_subject_template}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block">
              Sinov Qabul Qiluvchi Email
            </label>
            <Input
              type="email"
              placeholder="admin@ecommerce.uz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-xs font-medium"
              required
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Shablon test ma'lumotlar bilan render qilinib ko'rsatilgan manzilga yuboriladi.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Bekor qilish
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={testSendMutation.isPending || !email.trim()}
              className="gap-2 font-semibold"
            >
              {testSendMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Yuborilmoqda...</span>
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  <span>Test Xabarini Yuborish</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
