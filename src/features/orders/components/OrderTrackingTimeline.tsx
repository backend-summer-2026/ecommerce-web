'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Home,
  XCircle,
  Copy,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { ORDER_STATUS_MAP } from '@/features/orders/utils/statusUtils';
import type { OrderStatus, OrderStatusHistory } from '@/types/orders';
import { toast } from 'sonner';

interface OrderTrackingTimelineProps {
  status: OrderStatus;
  trackingNumber: string | null;
  timeline: OrderStatusHistory[];
}

export function OrderTrackingTimeline({
  status,
  trackingNumber,
  timeline,
}: OrderTrackingTimelineProps) {
  const isCancelled = status === 'CANCELLED';
  const isRefunded = status === 'REFUNDED';

  // Standart progress qadamlari
  const steps: Array<{
    key: OrderStatus;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      key: 'PENDING',
      title: 'Qabul qilindi',
      description: 'Buyurtmangiz ro‘yxatga olindi',
      icon: Clock,
    },
    {
      key: 'CONFIRMED',
      title: 'Tasdiqlandi',
      description: 'To‘lov va ma’lumotlar tekshirildi',
      icon: CheckCircle2,
    },
    {
      key: 'PROCESSING',
      title: 'Yig‘ilmoqda',
      description: 'Ombordan jo‘natishga tayyorlanmoqda',
      icon: Package,
    },
    {
      key: 'SHIPPED',
      title: 'Yetkazilmoqda',
      description: 'Kuryerlik xizmatiga topshirildi',
      icon: Truck,
    },
    {
      key: 'DELIVERED',
      title: 'Yetkazildi',
      description: 'Mijozga yetkazib berildi',
      icon: Home,
    },
  ];

  // Hozirgi bosqich indeksini aniqlash
  const stepHierarchy: Record<OrderStatus, number> = {
    PENDING: 0,
    AWAITING_PAYMENT: 0,
    CONFIRMED: 1,
    PROCESSING: 2,
    SHIPPED: 3,
    DELIVERED: 4,
    CANCELLED: -1,
    REFUNDED: -1,
  };

  const currentStepIndex = stepHierarchy[status] ?? 0;

  const copyTrackingNumber = () => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      toast.success('Kuzatuv kodi nusxalandi');
    }
  };

  return (
    <div className="space-y-8">
      {/* Agar bekor qilingan bo'lsa ogohlantirish */}
      {isCancelled && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive flex items-center gap-3">
          <XCircle className="size-5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Buyurtma bekor qilingan</h4>
            <p className="text-xs text-destructive/80 mt-0.5">
              Ushbu buyurtma bekor qilingan va yetkazib berish to‘xtatilgan.
            </p>
          </div>
        </div>
      )}

      {/* Tracking raqami bloki (mavjud bo'lsa) */}
      {trackingNumber && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Truck className="size-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Kuryer kuzatuv raqami (Tracking No):</span>
              <div className="font-mono font-bold text-sm text-foreground flex items-center gap-2">
                <span>{trackingNumber}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={copyTrackingNumber}
                  title="Nusxalash"
                >
                  <Copy className="size-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vizual bosqichlar (Steps Timeline) */}
      {!isCancelled && !isRefunded && (
        <div className="relative">
          {/* Gorizontal chiziq (desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-2 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isPassed = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={step.key}
                  className="flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center"
                >
                  <div
                    className={`size-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors shrink-0 shadow-sm ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>

                  <div className="space-y-0.5">
                    <p
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-primary'
                          : isPassed
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground hidden md:block">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Xronologik hodisalar tarixi */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="text-sm font-bold text-foreground">Holatlar xronologiyasi</h4>

        {timeline.length === 0 ? (
          <p className="text-xs text-muted-foreground">Hozircha hodisalar qayd etilmagan.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {timeline.map((event, idx) => {
              const statusCfg = ORDER_STATUS_MAP[event.new_status] || {
                label: event.new_status,
                color: 'text-foreground',
                bg: 'bg-muted',
                border: 'border-border',
              };

              return (
                <div key={event.id || idx} className="relative space-y-1">
                  {/* Nuqta */}
                  <div className="absolute -left-6 top-1 size-3 rounded-full bg-primary border-2 border-background" />

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs font-semibold px-2 py-0.5 ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}
                    >
                      {statusCfg.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(event.created_at)}
                    </span>
                    {event.created_by_name && (
                      <span className="text-[11px] text-muted-foreground">
                        ({event.created_by_name})
                      </span>
                    )}
                  </div>

                  {event.comment && (
                    <p className="text-xs text-foreground/90 pl-0.5">{event.comment}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
