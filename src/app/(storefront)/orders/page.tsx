'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ChevronRight,
  Clock,
  ArrowRight,
  FileText,
  Truck,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  ORDER_STATUS_MAP,
  PAYMENT_STATUS_MAP,
  PAYMENT_METHOD_MAP,
  SHIPPING_METHOD_MAP,
} from '@/features/orders/utils/statusUtils';

const STATUS_TABS: Array<{ id: string; label: string; status?: string }> = [
  { id: 'all', label: 'Barchasi' },
  { id: 'pending', label: 'Kutilmoqda', status: 'PENDING,AWAITING_PAYMENT' },
  { id: 'processing', label: 'Jarayonda', status: 'CONFIRMED,PROCESSING' },
  { id: 'shipped', label: 'Yetkazilmoqda', status: 'SHIPPED' },
  { id: 'delivered', label: 'Yetkazib berildi', status: 'DELIVERED' },
  { id: 'cancelled', label: 'Bekor qilingan', status: 'CANCELLED,REFUNDED' },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);

  const selectedFilter = STATUS_TABS.find((t) => t.id === activeTab);
  const statusParam = selectedFilter?.status;

  const { data, isLoading } = useOrders({
    status: statusParam,
    page,
  });

  const orders = data?.results || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8 min-h-[70vh]">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors">
          Bosh sahifa
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">Buyurtmalarim</span>
      </nav>

      {/* Sarlavha qatori */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Package className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Buyurtmalarim tarixi</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Barcha xaridlaringiz, to‘lov va yetkazib berish holatlari
            </p>
          </div>
        </div>

        <Link href="/catalog">
          <Button variant="outline" size="sm" className="gap-2 cursor-pointer font-medium">
            <ShoppingBag className="size-4" />
            <span>Katalogga o‘tish</span>
          </Button>
        </Link>
      </div>

      {/* Filter tablari */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Buyurtmalar ro'yxati */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-2xl border bg-card space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <div className="pt-2 flex justify-between items-center border-t">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-32 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl border bg-card space-y-4 max-w-md mx-auto">
          <div className="size-16 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
            <Package className="size-8 stroke-[1.5]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-base text-foreground">Hozircha buyurtmalar yo‘q</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Siz tanlagan filtr bo‘yicha hech qanday buyurtma topilmadi.
            </p>
          </div>
          <Link href="/catalog">
            <Button size="sm" className="gap-2 font-medium">
              <span>Xarid qilishni boshlash</span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
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
              <div
                key={order.id}
                className="rounded-2xl border bg-card p-5 sm:p-6 transition-all hover:border-primary/40 hover:shadow-sm space-y-4"
              >
                {/* Sarlavha qatori: Raqam, Sana, Status Badjlari */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-black text-base text-foreground">
                      #{order.order_number}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs font-semibold px-2.5 py-0.5 ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}
                    >
                      {statusCfg.label}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-semibold px-2 py-0.5 ${paymentStatusCfg.bg} ${paymentStatusCfg.color}`}
                    >
                      {paymentStatusCfg.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                </div>

                {/* Asosiy tafsilotlar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Tovarlar soni:</span>
                    <p className="font-bold text-foreground mt-0.5">{order.total_items} dona</p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">To‘lov usuli:</span>
                    <p className="font-medium text-foreground mt-0.5">
                      {PAYMENT_METHOD_MAP[order.payment_method] || order.payment_method}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Yetkazib berish:</span>
                    <p className="font-medium text-foreground mt-0.5">
                      {SHIPPING_METHOD_MAP[order.shipping_method]?.label || order.shipping_method}
                    </p>
                  </div>

                  <div className="text-right sm:text-left">
                    <span className="text-muted-foreground">Umumiy to‘lov:</span>
                    <p className="font-black text-sm text-primary mt-0.5">
                      {formatPrice(order.total_price)}
                    </p>
                  </div>
                </div>

                {/* Amallar: Batafsil, Tracking, Invoys */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Link href={`/orders/${order.order_number}/invoice`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <FileText className="size-3.5" />
                        <span>Chek (Invoys)</span>
                      </Button>
                    </Link>

                    <Link href={`/orders/${order.order_number}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Truck className="size-3.5" />
                        <span>Kuzatuv (Tracking)</span>
                      </Button>
                    </Link>
                  </div>

                  <Link href={`/orders/${order.order_number}`}>
                    <Button size="sm" className="h-8 gap-1.5 text-xs font-semibold cursor-pointer">
                      <span>Batafsil ko‘rish</span>
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination (agar 20 tadan ko'p bo'lsa) */}
      {data && data.count > 20 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Oldingi
          </Button>
          <span className="text-xs text-muted-foreground px-2">Sahifa {page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.next}
          >
            Keyingi
          </Button>
        </div>
      )}
    </div>
  );
}
