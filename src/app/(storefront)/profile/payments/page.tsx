'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  ChevronRight,
  Receipt,
  Clock,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCustomerPayments } from '@/features/payments/hooks/usePayments';
import {
  PAYMENT_STATUS_DETAILS,
  PAYMENT_PROVIDER_DETAILS,
} from '@/features/payments/utils/cardUtils';
import { CancelPaymentModal } from '@/features/payments/components/CancelPaymentModal';
import type { PaymentStatus, PaymentProvider } from '@/types/payments';

export default function CustomerPaymentsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  const [page, setPage] = useState(1);
  const [cancellingPaymentNumber, setCancellingPaymentNumber] = useState<string | null>(null);

  // Auth himoyasi
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login?redirect=/profile/payments');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const { data, isLoading, refetch } = useCustomerPayments({ page });
  const payments = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / 10) || 1;

  if (isAuthLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors">
          Bosh sahifa
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/profile" className="hover:text-foreground transition-colors">
          Shaxsiy kabinet
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">To‘lovlar tarixi</span>
      </nav>

      {/* Sarlavha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              To‘lovlar tarixi
            </h1>
            <Badge variant="secondary" className="font-bold text-xs">
              {totalCount} ta tranzaksiya
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Barcha to‘lovlar, kutilayotgan hisoblar va qaytarilgan mablag‘lar jurnali.
          </p>
        </div>

        <Link href="/profile/cards">
          <Button variant="outline" size="sm" className="gap-2 font-bold cursor-pointer">
            <CreditCard className="size-4" />
            <span>Bank kartalari</span>
          </Button>
        </Link>
      </div>

      {/* To'lovlar ro'yxati */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed bg-card/50 space-y-4">
          <div className="size-16 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
            <Receipt className="size-8" />
          </div>
          <div className="max-w-sm mx-auto space-y-1">
            <h3 className="text-base font-bold text-foreground">
              Hozircha hech qanday to‘lov amalga oshirilmagan
            </h3>
            <p className="text-xs text-muted-foreground">
              Buyurtma berganingizda amalga oshirilgan barcha to‘lovlar shu yerda aks etadi.
            </p>
          </div>
          <Link href="/catalog">
            <Button size="sm" className="gap-2 font-bold cursor-pointer">
              <span>Xarid qilishni boshlash</span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => {
            const statusConfig =
              PAYMENT_STATUS_DETAILS[payment.status as PaymentStatus] ||
              PAYMENT_STATUS_DETAILS.PENDING;
            const providerKey = payment.provider as PaymentProvider;
            const providerConfig = PAYMENT_PROVIDER_DETAILS[providerKey] || {
              name: payment.provider,
              badgeColor: 'bg-muted text-foreground border-border',
            };

            return (
              <div
                key={payment.payment_number}
                className="p-5 rounded-2xl border bg-card/80 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-foreground">
                      #{payment.payment_number}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs font-semibold px-2 py-0.5 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                    >
                      {statusConfig.label}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${providerConfig.badgeColor}`}
                    >
                      {providerConfig.name}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      <span>{formatDate(payment.created_at)}</span>
                    </span>
                    {payment.order_number && (
                      <span>
                        Buyurtma:{' '}
                        <Link
                          href={`/orders/${payment.order_number}`}
                          className="font-mono font-semibold text-primary hover:underline"
                        >
                          #{payment.order_number}
                        </Link>
                      </span>
                    )}
                  </div>

                  {payment.cancel_reason && (
                    <p className="text-xs text-destructive">
                      Sabab: {payment.cancel_reason}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <div className="text-xs text-muted-foreground">Summa</div>
                    <div className="text-lg font-black text-foreground">
                      {formatPrice(payment.amount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {payment.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCancellingPaymentNumber(payment.payment_number)}
                        className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2.5 cursor-pointer"
                      >
                        Bekor qilish
                      </Button>
                    )}

                    {payment.order_number && (
                      <Link href={`/orders/${payment.order_number}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2.5 text-xs gap-1 cursor-pointer"
                        >
                          <span>Buyurtma</span>
                          <ChevronRight className="size-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Sahifalash (Pagination) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="size-4" />
                <span>Oldingi</span>
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="gap-1 text-xs"
              >
                <span>Keyingi</span>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Bekor qilish modali */}
      {cancellingPaymentNumber && (
        <CancelPaymentModal
          paymentNumber={cancellingPaymentNumber}
          isOpen={!!cancellingPaymentNumber}
          onClose={() => setCancellingPaymentNumber(null)}
          onCancelled={() => {
            setCancellingPaymentNumber(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
