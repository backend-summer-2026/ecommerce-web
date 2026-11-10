'use client';

import React, { useState } from 'react';
import {
  useAdminPayments,
  useAdminRefunds,
  useAdminTransactions,
} from '@/features/dashboard/hooks/useDashboard';
import {
  IssueRefundModal,
} from '@/features/dashboard/components';
import { AdminPaymentListItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPagination } from '@/components/ui/AdminPagination';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  CreditCard,
  RotateCcw,
  RefreshCw,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<'PAYMENTS' | 'REFUNDS' | 'TRANSACTIONS'>('PAYMENTS');
  const [page, setPage] = useState(1);
  const [selectedPaymentForRefund, setSelectedPaymentForRefund] = useState<AdminPaymentListItem | null>(null);

  const {
    data: paymentsData,
    isLoading: isPaymentsLoading,
    refetch: refetchPayments,
  } = useAdminPayments({ page, page_size: 15 });

  const {
    data: refundsData,
    isLoading: isRefundsLoading,
    refetch: refetchRefunds,
  } = useAdminRefunds({ page, page_size: 15 });

  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = useAdminTransactions({ page, page_size: 20 });

  const handleRefresh = () => {
    refetchPayments();
    refetchRefunds();
    refetchTransactions();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'COMPLETED':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Muvaffaqiyatli</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-200">Qaytarilgan</Badge>;
      case 'PARTIALLY_REFUNDED':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Qisman qaytarilgan</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Xatolik</Badge>;
      default:
        return <Badge variant="outline">Kutilmoqda</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="size-7 text-primary" />
            <span>To'lovlar Auditi & Mablag' Qaytarish (Refunds)</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Payme, Click, karta orqali to'lovlar auditi, xatoliklar va to'liq/qisman mablag' qaytarish operatsiyalari.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="gap-1.5 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className="size-3.5" />
          <span>Yangilash</span>
        </Button>
      </div>

      {/* Tablar */}
      <div className="flex items-center gap-2 border-b pb-3">
        <Button
          variant={activeTab === 'PAYMENTS' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('PAYMENTS')}
          className="text-xs font-semibold gap-1.5"
        >
          <CreditCard className="size-3.5" />
          <span>Barcha To'lovlar</span>
          <span className="text-[10px] ml-1 opacity-70">
            ({paymentsData?.count ?? '...'})
          </span>
        </Button>

        <Button
          variant={activeTab === 'REFUNDS' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('REFUNDS')}
          className="text-xs font-semibold gap-1.5"
        >
          <RotateCcw className="size-3.5 text-orange-500" />
          <span>Qaytarilgan Mablag'lar (Refunds)</span>
          <span className="text-[10px] ml-1 opacity-70">
            ({refundsData?.count ?? '...'})
          </span>
        </Button>

        <Button
          variant={activeTab === 'TRANSACTIONS' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('TRANSACTIONS')}
          className="text-xs font-semibold gap-1.5"
        >
          <Activity className="size-3.5" />
          <span>Gateway Tranzaksiyalari</span>
        </Button>
      </div>

      {/* 1. To'lovlar Ro'yxati */}
      {activeTab === 'PAYMENTS' && (
        <Card>
          <CardContent className="p-0">
            {isPaymentsLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : (paymentsData?.results ?? []).length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                To'lovlar topilmadi
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                      <th className="py-3 px-4 font-medium font-mono">To'lov #</th>
                      <th className="py-3 px-4 font-medium font-mono">Buyurtma #</th>
                      <th className="py-3 px-4 font-medium">Provayder</th>
                      <th className="py-3 px-4 font-medium text-right">Summa</th>
                      <th className="py-3 px-4 font-medium text-center">Status</th>
                      <th className="py-3 px-4 font-medium">Sana & Vaqt</th>
                      <th className="py-3 px-4 font-medium text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paymentsData?.results.map((payment) => (
                      <tr key={payment.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          {payment.payment_number}
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {payment.order_number}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="font-semibold text-[10px]">
                            {payment.provider_display || payment.provider}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-foreground">
                          {formatPrice(Number(payment.amount || 0), { currency: 'UZS' })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {formatDate(payment.created_at)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {payment.status === 'PAID' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPaymentForRefund(payment)}
                              className="h-7 px-2 text-xs font-semibold gap-1 text-orange-600 hover:text-orange-700 hover:border-orange-300"
                            >
                              <RotateCcw className="size-3" />
                              <span>Qaytarish (Refund)</span>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>

          <AdminPagination
            page={page}
            totalCount={paymentsData?.count || 0}
            pageSize={15}
            onPageChange={(newPage) => setPage(newPage)}
            isLoading={isPaymentsLoading}
          />
        </Card>
      )}

      {/* 2. Refunds Ro'yxati */}
      {activeTab === 'REFUNDS' && (
        <Card>
          <CardContent className="p-0">
            {isRefundsLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (refundsData?.results ?? []).length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                Mablag' qaytarish operatsiyalari topilmadi
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                      <th className="py-3 px-4 font-medium font-mono">Refund #</th>
                      <th className="py-3 px-4 font-medium font-mono">To'lov #</th>
                      <th className="py-3 px-4 font-medium font-mono">Buyurtma #</th>
                      <th className="py-3 px-4 font-medium text-right">Qaytarilgan Summa</th>
                      <th className="py-3 px-4 font-medium text-center">Status</th>
                      <th className="py-3 px-4 font-medium">Sababi</th>
                      <th className="py-3 px-4 font-medium">Operator</th>
                      <th className="py-3 px-4 font-medium">Sana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {refundsData?.results.map((refund) => (
                      <tr key={refund.id} className="hover:bg-muted/20">
                        <td className="py-3 px-4 font-mono font-bold text-orange-600">
                          {refund.refund_number}
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {refund.payment_number}
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {refund.order_number}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-foreground">
                          {formatPrice(Number(refund.amount || 0), { currency: 'UZS' })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                            {refund.status_display || refund.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground max-w-[200px] truncate">
                          {refund.reason || '—'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {refund.created_by_username || 'Tizim'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {formatDate(refund.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>

          <AdminPagination
            page={page}
            totalCount={refundsData?.count || 0}
            pageSize={15}
            onPageChange={(newPage) => setPage(newPage)}
            isLoading={isRefundsLoading}
          />
        </Card>
      )}

      {/* 3. Tranzaksiyalar Ro'yxati */}
      {activeTab === 'TRANSACTIONS' && (
        <Card>
          <CardContent className="p-0">
            {isTransactionsLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (transactionsData?.results ?? []).length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                Tranzaksiyalar jurnali topilmadi
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                      <th className="py-3 px-4 font-medium">Sana & Vaqt</th>
                      <th className="py-3 px-4 font-medium font-mono">To'lov #</th>
                      <th className="py-3 px-4 font-medium">Provayder</th>
                      <th className="py-3 px-4 font-medium">Hodisa (Event)</th>
                      <th className="py-3 px-4 font-medium text-center">Status</th>
                      <th className="py-3 px-4 font-medium">Xabar / Detal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactionsData?.results.map((tx) => (
                      <tr key={tx.id} className="hover:bg-muted/20">
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {formatDate(tx.created_at)}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          {tx.payment_number}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {tx.provider}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-primary">
                          {tx.event_type}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(tx.status)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground max-w-[250px] truncate">
                          {tx.message || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>

          <AdminPagination
            page={page}
            totalCount={transactionsData?.count || 0}
            pageSize={20}
            onPageChange={(newPage) => setPage(newPage)}
            isLoading={isTransactionsLoading}
          />
        </Card>
      )}

      {/* Refund Modali */}
      <IssueRefundModal
        payment={selectedPaymentForRefund}
        isOpen={Boolean(selectedPaymentForRefund)}
        onClose={() => setSelectedPaymentForRefund(null)}
      />
    </div>
  );
}
