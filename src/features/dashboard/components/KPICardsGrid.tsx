'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  ShoppingCart,
  Users,
  CheckCircle2,
  XCircle,
  PackageCheck,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Receipt,
} from 'lucide-react';
import { ExecutiveKPIOverview } from '@/types';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface KPICardsGridProps {
  data?: ExecutiveKPIOverview;
  isLoading: boolean;
}

export function KPICardsGrid({ data, isLoading }: KPICardsGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = data?.kpis;
  const growth = data?.growth;

  const totalRev = kpis?.total_revenue ? Number(kpis.total_revenue) : 0;
  const aov = kpis?.average_order_value ? Number(kpis.average_order_value) : 0;
  const refunded = kpis?.refunded_amount ? Number(kpis.refunded_amount) : 0;
  const totalOrders = kpis?.total_orders ?? 0;
  const completedOrders = kpis?.completed_orders_count ?? 0;
  const cancelledOrders = kpis?.cancelled_orders_count ?? 0;
  const newCustomers = kpis?.new_customers_count ?? 0;
  const totalItemsSold = kpis?.total_items_sold ?? 0;

  const revGrowth = growth?.revenue_growth_pct ?? 0;
  const ordersGrowth = growth?.orders_growth_pct ?? 0;

  const cards = [
    {
      title: 'Jami Tushum',
      value: formatPrice(totalRev, { currency: 'UZS' }),
      icon: DollarSign,
      growth: revGrowth,
      growthText: `${revGrowth >= 0 ? '+' : ''}${revGrowth}% o'tgan davrga nisbatan`,
      isPositive: revGrowth >= 0,
      iconColor: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      title: 'Buyurtmalar Soni',
      value: totalOrders.toLocaleString('uz-UZ'),
      icon: ShoppingCart,
      growth: ordersGrowth,
      growthText: `${ordersGrowth >= 0 ? '+' : ''}${ordersGrowth}% o'tgan davrga nisbatan`,
      isPositive: ordersGrowth >= 0,
      iconColor: 'text-blue-500 bg-blue-500/10',
    },
    {
      title: "O'rtacha Chek (AOV)",
      value: formatPrice(aov, { currency: 'UZS' }),
      icon: Receipt,
      subText: "Har bir to'langan buyurtma hisobiga",
      iconColor: 'text-purple-500 bg-purple-500/10',
    },
    {
      title: 'Yangi Mijozlar',
      value: `+${newCustomers.toLocaleString('uz-UZ')}`,
      icon: Users,
      subText: 'Tanlangan vaqt oraligida',
      iconColor: 'text-sky-500 bg-sky-500/10',
    },
    {
      title: 'Bajarilgan Buyurtmalar',
      value: completedOrders.toLocaleString('uz-UZ'),
      icon: CheckCircle2,
      subText: `${totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}% konversiya ulushi`,
      iconColor: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      title: 'Bekor Qilinganlar',
      value: cancelledOrders.toLocaleString('uz-UZ'),
      icon: XCircle,
      subText: `${totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0}% bekor qilish darajasi`,
      iconColor: 'text-rose-500 bg-rose-500/10',
    },
    {
      title: 'Sotilgan Mahsulotlar',
      value: `${totalItemsSold.toLocaleString('uz-UZ')} dona`,
      icon: PackageCheck,
      subText: 'Yetkazilgan tovarlar soni',
      iconColor: 'text-amber-500 bg-amber-500/10',
    },
    {
      title: "Qaytarilgan Mablag' (Refund)",
      value: formatPrice(refunded, { currency: 'UZS' }),
      icon: RotateCcw,
      subText: "Mijozlarga to'lab berilgan",
      iconColor: 'text-orange-500 bg-orange-500/10',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={cn('p-2 rounded-lg', card.iconColor)}>
                <Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{card.value}</div>
              <div className="mt-1 flex items-center text-xs">
                {card.growth !== undefined ? (
                  <span
                    className={cn(
                      'flex items-center font-semibold mr-1.5',
                      card.isPositive ? 'text-emerald-600' : 'text-rose-600'
                    )}
                  >
                    {card.isPositive ? (
                      <TrendingUp className="size-3.5 mr-0.5 inline" />
                    ) : (
                      <TrendingDown className="size-3.5 mr-0.5 inline" />
                    )}
                    {card.growthText}
                  </span>
                ) : (
                  <span className="text-muted-foreground">{card.subText}</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
