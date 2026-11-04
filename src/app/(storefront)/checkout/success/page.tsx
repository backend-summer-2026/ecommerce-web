'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  ShoppingBag,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';
import { useOrderDetail } from '@/features/orders/hooks/useOrders';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order_number') || '';

  const { data: order, isLoading } = useOrderDetail(orderNumber);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <Skeleton className="size-16 rounded-full mx-auto" />
        <Skeleton className="h-6 w-3/4 mx-auto rounded-md" />
        <Skeleton className="h-4 w-1/2 mx-auto rounded-md" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4 sm:px-6">
      <div className="p-8 sm:p-10 rounded-3xl border bg-card text-center space-y-6 shadow-xl">
        <div className="size-20 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5 animate-in zoom-in-95">
          <CheckCircle2 className="size-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Xaridingiz uchun rahmat!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Buyurtmangiz muvaffaqiyatli qabul qilindi. Tez orada operatorlarimiz yoki kuryer siz bilan bog‘lanadi.
          </p>
        </div>

        {orderNumber && (
          <div className="p-5 rounded-2xl bg-muted/50 border text-left space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-muted-foreground">Buyurtma kodi:</span>
              <span className="font-mono font-bold text-foreground">
                #{orderNumber}
              </span>
            </div>
            {order?.total_price && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">To‘lov summasi:</span>
                <span className="font-black text-primary text-sm">
                  {formatPrice(order.total_price)}
                </span>
              </div>
            )}
            {order?.payment_status && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground">To‘lov holati:</span>
                <span className="font-bold text-emerald-600">
                  {order.payment_status}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {orderNumber && (
            <Link href={`/orders/${orderNumber}`} className="w-full sm:w-auto">
              <Button size="sm" className="w-full gap-2 font-bold text-xs cursor-pointer">
                <Package className="size-4" />
                <span>Buyurtmani kuzatish</span>
              </Button>
            </Link>
          )}

          <Link href="/catalog" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-xs font-semibold"
            >
              <ShoppingBag className="size-4" />
              <span>Xaridni davom ettirish</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="max-w-md mx-auto py-16 text-center space-y-4">
            <Skeleton className="size-16 rounded-full mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto rounded-md" />
          </div>
        }
      >
        <CheckoutSuccessContent />
      </Suspense>
    </div>
  );
}
