'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrderTracking } from '@/features/orders/hooks/useOrders';
import { OrderTrackingTimeline } from '@/features/orders/components/OrderTrackingTimeline';

interface OrderTrackingClientProps {
  orderNumber: string;
}

export function OrderTrackingClient({ orderNumber }: OrderTrackingClientProps) {
  const { data: tracking, isLoading, error } = useOrderTracking(orderNumber);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl space-y-6">
        <Skeleton className="h-9 w-40 rounded-lg" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 text-center space-y-4 max-w-md">
        <div className="size-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertTriangle className="size-8" />
        </div>
        <h2 className="text-xl font-bold">Kuzatuv ma'lumotlari topilmadi</h2>
        <p className="text-xs text-muted-foreground">
          Buyurtma tracking ma'lumotlarini yuklashda xatolik yuz berdi.
        </p>
        <Link href={`/orders/${orderNumber}`}>
          <Button size="sm" variant="outline" className="gap-2">
            <ArrowLeft className="size-4" />
            <span>Buyurtmaga qaytish</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl space-y-6">
      <Link href={`/orders/${orderNumber}`}>
        <Button variant="ghost" size="sm" className="gap-2 cursor-pointer">
          <ArrowLeft className="size-4" />
          <span>Buyurtmaga qaytish</span>
        </Button>
      </Link>

      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Truck className="size-5 text-primary" />
            <span>Buyurtma kuzatuvi: #{tracking.order_number}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <OrderTrackingTimeline
            status={tracking.status}
            trackingNumber={tracking.tracking_number}
            timeline={tracking.timeline || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
