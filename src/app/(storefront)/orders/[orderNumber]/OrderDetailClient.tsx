'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight,
  Clock,
  ArrowLeft,
  FileText,
  MapPin,
  Truck,
  AlertTriangle,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrderDetail } from '@/features/orders/hooks/useOrders';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  ORDER_STATUS_MAP,
  PAYMENT_STATUS_MAP,
  PAYMENT_METHOD_MAP,
  SHIPPING_METHOD_MAP,
} from '@/features/orders/utils/statusUtils';
import { OrderTrackingTimeline } from '@/features/orders/components/OrderTrackingTimeline';
import { CancelOrderModal } from '@/features/orders/components/CancelOrderModal';

interface OrderDetailClientProps {
  orderNumber: string;
}

export function OrderDetailClient({ orderNumber }: OrderDetailClientProps) {
  const { data: order, isLoading, error, refetch } = useOrderDetail(orderNumber);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 space-y-6 max-w-5xl">
        <Skeleton className="h-6 w-48 rounded-md" />
        <Skeleton className="h-10 w-3/4 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 text-center space-y-4 max-w-md">
        <div className="size-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertTriangle className="size-8" />
        </div>
        <h2 className="text-xl font-bold">Buyurtma topilmadi</h2>
        <p className="text-xs text-muted-foreground">
          Siz qidirayotgan buyurtma mavjud emas yoki sizda uni ko‘rish huquqi yo‘q.
        </p>
        <Link href="/orders">
          <Button size="sm" variant="outline" className="gap-2">
            <ArrowLeft className="size-4" />
            <span>Buyurtmalar ro‘yxatiga qaytish</span>
          </Button>
        </Link>
      </div>
    );
  }

  const statusCfg = ORDER_STATUS_MAP[order.status] || {
    label: order.status,
    color: 'text-foreground',
    bg: 'bg-muted',
    border: 'border-border',
  };
  const paymentStatusCfg = PAYMENT_STATUS_MAP[order.payment_status] || {
    label: order.payment_status,
    color: 'text-foreground',
    bg: 'bg-muted',
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8 max-w-5xl">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors">
          Bosh sahifa
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/orders" className="hover:text-foreground transition-colors">
          Buyurtmalarim
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">#{order.order_number}</span>
      </nav>

      {/* Sarlavha qatori */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
              #{order.order_number}
            </h1>
            <Badge
              variant="outline"
              className={`text-xs font-semibold px-2.5 py-0.5 ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}
            >
              {statusCfg.label}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs font-semibold px-2.5 py-0.5 ${paymentStatusCfg.bg} ${paymentStatusCfg.color}`}
            >
              {paymentStatusCfg.label}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Clock className="size-3.5" />
            <span>Rasmiylashtirilgan sana: {formatDate(order.created_at)}</span>
          </p>
        </div>

        {/* Amallar: Invoys va Bekor qilish */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href={`/orders/${order.order_number}/invoice`}>
            <Button variant="outline" size="sm" className="gap-2 cursor-pointer font-semibold text-xs">
              <FileText className="size-4" />
              <span>Invoys (Chek)</span>
            </Button>
          </Link>

          {order.can_cancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsCancelModalOpen(true)}
              className="gap-2 cursor-pointer font-semibold text-xs"
            >
              <XCircle className="size-4" />
              <span>Buyurtmani bekor qilish</span>
            </Button>
          )}
        </div>
      </div>

      {/* Bekor qilinganlik sababi */}
      {order.status === 'CANCELLED' && order.cancellation_reason && (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-xs text-destructive flex items-start gap-2.5">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Bekor qilinish sababi:</span> {order.cancellation_reason}
          </div>
        </div>
      )}

      {/* 1. Interaktiv Tracking Timeline */}
      <Card className="rounded-2xl border shadow-xs">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Truck className="size-5 text-primary" />
            <span>Yetkazib berish bosqichlari (Tracking)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <OrderTrackingTimeline
            status={order.status}
            trackingNumber={order.tracking_number}
            timeline={order.status_history || []}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Chap ustun: Tovar elementlari */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Buyurtma tarkibi</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {order.total_items} dona tovar
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 divide-y divide-border/40">
              {order.items.map((item) => (
                <div key={item.id} className="py-3.5 first:pt-1 last:pb-1 flex gap-3 sm:gap-4 items-center">
                  <div className="relative size-16 sm:size-20 rounded-xl border bg-muted/30 shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Sparkles className="size-5 opacity-40" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate">
                      {item.product_name}
                    </h4>

                    {item.variant_attributes_display && (
                      <p className="text-[11px] text-muted-foreground">
                        {item.variant_attributes_display}
                      </p>
                    )}

                    <div className="text-[11px] text-muted-foreground">
                      {item.quantity} x {formatPrice(item.unit_price)}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-sm text-foreground">
                      {formatPrice(item.total_price)}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* O'ng ustun: Manzil va Hisob-kitob */}
        <div className="lg:col-span-5 space-y-6">
          {/* Manzil va Qabul qiluvchi */}
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                <span>Qabul qiluvchi va Manzil</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground">Qabul qiluvchi:</span>
                <p className="font-semibold text-foreground text-sm mt-0.5">
                  {order.shipping_address?.recipient_name}
                </p>
                <p className="text-muted-foreground">{order.shipping_address?.phone_number}</p>
              </div>

              <div className="border-t pt-2">
                <span className="text-muted-foreground">Yetkazish manzili:</span>
                <p className="font-medium text-foreground mt-0.5">
                  {order.shipping_address?.full_address ||
                    `${order.shipping_address?.region || ''}, ${
                      order.shipping_address?.district || ''
                    }, ${order.shipping_address?.street_address || ''}`}
                </p>
                {order.shipping_address?.landmark && (
                  <p className="text-muted-foreground mt-0.5">
                    Mo‘ljal: {order.shipping_address.landmark}
                  </p>
                )}
                {order.shipping_address?.delivery_instructions && (
                  <p className="text-muted-foreground mt-0.5 italic">
                    «{order.shipping_address.delivery_instructions}»
                  </p>
                )}
              </div>

              <div className="border-t pt-2 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Yetkazib berish:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {SHIPPING_METHOD_MAP[order.shipping_method]?.label || order.shipping_method}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground">To‘lov usuli:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {PAYMENT_METHOD_MAP[order.payment_method] || order.payment_method}
                  </p>
                </div>
              </div>

              {order.customer_notes && (
                <div className="border-t pt-2">
                  <span className="text-muted-foreground">Xaridor eslatmasi:</span>
                  <p className="text-foreground mt-0.5 italic">«{order.customer_notes}»</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Moliyaviy xulosa */}
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold">Moliyaviy hisobot</CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Mahsulotlar narxi:</span>
                <span className="font-semibold text-foreground">{formatPrice(order.subtotal)}</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Yetkazib berish narxi:</span>
                <span className="font-semibold text-foreground">
                  {parseFloat(order.shipping_fee || '0') === 0
                    ? 'Bepul'
                    : formatPrice(order.shipping_fee)}
                </span>
              </div>

              {parseFloat(order.discount_amount || '0') > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Chegirma:</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}

              <div className="border-t pt-3 flex justify-between items-baseline font-bold text-sm text-foreground">
                <span>Yakuniy to‘lov:</span>
                <span className="text-xl font-black text-primary">
                  {formatPrice(order.total_price)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bekor qilish modali */}
      <CancelOrderModal
        orderNumber={order.order_number}
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onCancelled={() => refetch()}
      />
    </div>
  );
}
