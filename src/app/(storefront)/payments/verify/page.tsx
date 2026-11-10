'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';
import { useOrderDetail } from '@/features/orders/hooks/useOrders';
import { usePaymentDetail } from '@/features/payments/hooks/usePayments';

function PaymentVerifyContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order_number') || '';
  const paymentNumber = searchParams.get('payment_number') || '';

  const {
    data: order,
    isLoading: isOrderLoading,
    refetch: refetchOrder,
  } = useOrderDetail(orderNumber);

  const {
    data: payment,
    isLoading: isPaymentLoading,
    refetch: refetchPayment,
  } = usePaymentDetail(paymentNumber, !!paymentNumber);

  const isLoading = isOrderLoading || (!!paymentNumber && isPaymentLoading);

  const handleRefresh = () => {
    refetchOrder();
    if (paymentNumber) refetchPayment();
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <Skeleton className="size-16 rounded-full mx-auto" />
        <Skeleton className="h-6 w-3/4 mx-auto rounded-md" />
        <Skeleton className="h-4 w-1/2 mx-auto rounded-md" />
      </div>
    );
  }

  // To'lov holatini aniqlash
  const isPaid =
    order?.payment_status === 'PAID' || payment?.status === 'PAID';
  const isCancelled =
    order?.status === 'CANCELLED' || payment?.status === 'CANCELLED';
  const isFailed =
    order?.payment_status === 'FAILED' || payment?.status === 'FAILED';

  return (
    <div className="max-w-xl mx-auto py-12 px-4 sm:px-6">
      <div className="p-8 sm:p-10 rounded-3xl border bg-card text-center space-y-6 shadow-xl">
        {/* Status Ikonkasi */}
        {isPaid ? (
          <div className="size-20 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5 animate-in zoom-in-95">
            <CheckCircle2 className="size-10" />
          </div>
        ) : isFailed || isCancelled ? (
          <div className="size-20 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto ring-8 ring-destructive/5 animate-in zoom-in-95">
            <AlertTriangle className="size-10" />
          </div>
        ) : (
          <div className="size-20 rounded-3xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-500/5 animate-in zoom-in-95">
            <Clock className="size-10" />
          </div>
        )}

        {/* Sarlavha va matn */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            {isPaid
              ? 'To‘lov muvaffaqiyatli qabul qilindi!'
              : isFailed
              ? 'To‘lov amalga oshmadi'
              : isCancelled
              ? 'To‘lov bekor qilindi'
              : 'To‘lov tasdiqlanishi kutilmoqda'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            {isPaid
              ? 'To‘lovingiz tizim tomonidan qabul qilindi va buyurtmangiz tez orada yig‘ishga yuboriladi.'
              : isFailed
              ? 'To‘lov jarayonida xatolik yuz berdi. Iltimos, qayta urinib ko‘ring yoki boshqa to‘lov turini tanlang.'
              : isCancelled
              ? 'To‘lov operatsiyasi mijoz yoki bank tomonidan bekor qilindi.'
              : 'To‘lov shlyuzidan javob kutilmoqda. Qayta tekshirish tugmasini bosishingiz mumkin.'}
          </p>
        </div>

        {/* Buyurtma va To'lov kvitansiya kartochkasi */}
        <div className="p-5 rounded-2xl bg-muted/50 border text-left space-y-3 text-xs">
          {orderNumber && (
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-muted-foreground">Buyurtma raqami:</span>
              <span className="font-mono font-bold text-foreground">
                #{orderNumber}
              </span>
            </div>
          )}

          {paymentNumber && (
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-muted-foreground">To‘lov kodi:</span>
              <span className="font-mono font-bold text-foreground">
                #{paymentNumber}
              </span>
            </div>
          )}

          {order?.total_price && (
            <div className="flex items-center justify-between text-sm pt-1">
              <span className="font-medium text-foreground">Jami summa:</span>
              <span className="font-black text-primary text-base">
                {formatPrice(order.total_price)}
              </span>
            </div>
          )}
        </div>

        {/* Amallar tugmalari */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {!isPaid && !isFailed && !isCancelled && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="w-full sm:w-auto gap-2 text-xs font-semibold"
            >
              <RefreshCw className="size-4" />
              <span>Statusni qayta tekshirish</span>
            </Button>
          )}

          {orderNumber && (
            <Link href={`/orders/${orderNumber}`} className="w-full sm:w-auto">
              <Button size="sm" className="w-full gap-2 font-bold text-xs cursor-pointer">
                <span>Buyurtmani ko‘rish</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          )}

          <Link href="/catalog" className="w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-2 text-xs text-muted-foreground"
            >
              <ShoppingBag className="size-4" />
              <span>Do‘konga qaytish</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentVerifyPage() {
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
        <PaymentVerifyContent />
      </Suspense>
    </div>
  );
}
