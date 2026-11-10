'use client';

import React from 'react';
import { DashboardOrderListItem } from '@/types';
import { OrderStatus } from '@/types/orders';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  ShoppingBag,
  ArrowRight,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle2,
  Truck,
  Package,
} from 'lucide-react';

interface OrdersKanbanBoardProps {
  orders: DashboardOrderListItem[];
  onInspectOrder: (orderNumber: string) => void;
  onUpdateStatus: (order: DashboardOrderListItem, nextStatus: OrderStatus) => void;
  isLoading?: boolean;
}

const KANBAN_COLUMNS: Array<{
  status: OrderStatus;
  title: string;
  nextStatus?: OrderStatus;
  nextActionLabel?: string;
  badgeClass: string;
  borderClass: string;
  icon: React.ElementType;
}> = [
  {
    status: 'PENDING',
    title: 'Kutilmoqda',
    nextStatus: 'CONFIRMED',
    nextActionLabel: 'Tasdiqlash',
    badgeClass: 'bg-amber-500/10 text-amber-600 border-amber-300',
    borderClass: 'border-t-amber-500',
    icon: Clock,
  },
  {
    status: 'CONFIRMED',
    title: 'Tasdiqlangan',
    nextStatus: 'PROCESSING',
    nextActionLabel: 'Yig‘ishga berish',
    badgeClass: 'bg-teal-500/10 text-teal-600 border-teal-300',
    borderClass: 'border-t-teal-500',
    icon: CheckCircle2,
  },
  {
    status: 'PROCESSING',
    title: "Yig'ilmoqda",
    nextStatus: 'SHIPPED',
    nextActionLabel: 'Kuryerga berish',
    badgeClass: 'bg-purple-500/10 text-purple-600 border-purple-300',
    borderClass: 'border-t-purple-500',
    icon: Package,
  },
  {
    status: 'SHIPPED',
    title: "Yo'lda (Kuryer)",
    nextStatus: 'DELIVERED',
    nextActionLabel: 'Topshirildi',
    badgeClass: 'bg-blue-500/10 text-blue-600 border-blue-300',
    borderClass: 'border-t-blue-500',
    icon: Truck,
  },
  {
    status: 'DELIVERED',
    title: 'Yetkazildi',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-300',
    borderClass: 'border-t-emerald-500',
    icon: CheckCircle2,
  },
];

export function OrdersKanbanBoard({
  orders,
  onInspectOrder,
  onUpdateStatus,
  isLoading,
}: OrdersKanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map((col) => {
        const Icon = col.icon;
        const columnOrders = orders.filter((o) => o.status === col.status);

        return (
          <div
            key={col.status}
            className={`flex flex-col rounded-xl border border-t-4 ${col.borderClass} bg-muted/20 min-w-[260px] h-[720px] shadow-2xs`}
          >
            {/* Ustun Sarlavhasi */}
            <div className="p-3 border-b bg-card rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                <span className="font-bold text-xs text-foreground">{col.title}</span>
              </div>
              <Badge className={`${col.badgeClass} text-[10px] py-0 px-2 font-bold`}>
                {columnOrders.length}
              </Badge>
            </div>

            {/* Buyurtma Kartalari Oqimi */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
              {columnOrders.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-lg">
                  Buyurtma yo'q
                </div>
              ) : (
                columnOrders.map((order) => (
                  <Card
                    key={order.id}
                    className="p-3 shadow-xs hover:shadow-md transition-shadow bg-card space-y-2.5 border"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => onInspectOrder(order.order_number)}
                        className="font-mono font-bold text-xs text-primary hover:underline"
                      >
                        {order.order_number}
                      </button>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(order.created_at)}
                      </span>
                    </div>

                    <div>
                      <p className="font-semibold text-xs text-foreground truncate">
                        {order.customer_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {order.user_email}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t">
                      <span className="text-muted-foreground text-[11px]">
                        {order.items_count} dona tovar
                      </span>
                      <span className="font-bold text-foreground">
                        {formatPrice(Number(order.total_price || 0), { currency: 'UZS' })}
                      </span>
                    </div>

                    {/* Izohlar & Amallar */}
                    <div className="flex items-center justify-between pt-1 gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onInspectOrder(order.order_number)}
                        className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Eye className="size-3" />
                        <span>Ko'rish</span>
                      </Button>

                      {col.nextStatus && col.nextActionLabel && (
                        <Button
                          size="sm"
                          onClick={() => onUpdateStatus(order, col.nextStatus!)}
                          className="h-7 px-2 text-[11px] gap-1 font-semibold cursor-pointer"
                        >
                          <span>{col.nextActionLabel}</span>
                          <ArrowRight className="size-3" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
