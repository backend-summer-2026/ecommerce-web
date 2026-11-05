'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SalesChartPoint } from '@/types';
import { formatPrice } from '@/lib/utils';
import { DollarSign, ShoppingBag, Calendar } from 'lucide-react';

interface SalesDynamicsChartProps {
  data?: SalesChartPoint[];
  isLoading: boolean;
  days: number;
  onDaysChange: (days: number) => void;
}

export function SalesDynamicsChart({
  data = [],
  isLoading,
  days,
  onDaysChange,
}: SalesDynamicsChartProps) {
  const [metric, setMetric] = useState<'revenue' | 'orders'>('revenue');

  const chartData = data.map((item) => ({
    date: item.date,
    revenue: Number(item.revenue || 0),
    orders_count: item.orders_count || 0,
    formattedDate: new Date(item.date).toLocaleDateString('uz-UZ', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  const totalRevenue = chartData.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalOrders = chartData.reduce((acc, curr) => acc + curr.orders_count, 0);

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <span>Savdo Dinamikasi Grafigi</span>
          </CardTitle>
          <CardDescription>
            Oxirgi {days} kun davomidagi umumiy tushum: {formatPrice(totalRevenue, { currency: 'UZS' })} (
            {totalOrders} ta buyurtma)
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metrika tanlagich */}
          <div className="inline-flex rounded-lg border bg-muted/40 p-1">
            <Button
              variant={metric === 'revenue' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMetric('revenue')}
              className="h-7 text-xs gap-1.5 px-2.5 font-medium"
            >
              <DollarSign className="size-3.5" />
              <span>Tushum</span>
            </Button>
            <Button
              variant={metric === 'orders' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMetric('orders')}
              className="h-7 text-xs gap-1.5 px-2.5 font-medium"
            >
              <ShoppingBag className="size-3.5" />
              <span>Buyurtmalar</span>
            </Button>
          </div>

          {/* Kunlar filtri */}
          <div className="inline-flex rounded-lg border bg-muted/40 p-1">
            {[7, 14, 30, 90].map((d) => (
              <Button
                key={d}
                variant={days === d ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onDaysChange(d)}
                className="h-7 text-xs px-2.5 font-medium"
              >
                {d}k
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="h-[320px] w-full flex items-center justify-center">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[320px] w-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Calendar className="size-8 text-muted-foreground/60" />
            <p className="text-sm">Tanlangan davr uchun savdo ma'lumotlari topilmadi</p>
          </div>
        ) : (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis
                  dataKey="formattedDate"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  className="fill-muted-foreground"
                  tickFormatter={(val) => {
                    if (metric === 'revenue') {
                      if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
                      if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
                      return String(val);
                    }
                    return String(val);
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const row = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-card p-3 shadow-md text-xs space-y-1">
                          <p className="font-semibold text-foreground">{row.date}</p>
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            <span className="text-muted-foreground">Tushum:</span>
                            <span className="font-bold text-foreground">
                              {formatPrice(row.revenue, { currency: 'UZS' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-blue-500" />
                            <span className="text-muted-foreground">Buyurtmalar:</span>
                            <span className="font-bold text-foreground">
                              {row.orders_count} ta
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {metric === 'revenue' ? (
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                ) : (
                  <Area
                    type="monotone"
                    dataKey="orders_count"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#ordersGradient)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
