'use client';

import React, { useState } from 'react';
import {
  useAdminOrders,
  useUpdateOrderStatus,
} from '@/features/dashboard/hooks/useDashboard';
import {
  OrderDetailModal,
  OrderStatusUpdateModal,
  OrdersKanbanBoard,
} from '@/features/dashboard/components';
import { PermissionGate } from '@/features/admin/rbac';
import { exportToCsv } from '@/lib/exportUtils';
import { DashboardOrderListItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPagination } from '@/components/ui/AdminPagination';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Eye,
  Edit,
  MessageSquare,
  Clock,
  Filter,
  LayoutList,
  Kanban,
  Download,
} from 'lucide-react';
import { OrderStatus } from '@/types/orders';

const STATUS_TABS: Array<{ label: string; value: string }> = [
  { label: 'Barchasi', value: '' },
  { label: 'Kutilmoqda', value: 'PENDING' },
  { label: 'Tasdiqlangan', value: 'CONFIRMED' },
  { label: "Yig'ilmoqda", value: 'PROCESSING' },
  { label: "Yo'lda (Kuryer)", value: 'SHIPPED' },
  { label: 'Yetkazildi', value: 'DELIVERED' },
  { label: 'Bekor qilingan', value: 'CANCELLED' },
];

export default function AdminOrdersPage() {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const [inspectOrderNumber, setInspectOrderNumber] = useState<string | null>(null);
  const [statusModalOrder, setStatusModalOrder] = useState<DashboardOrderListItem | null>(null);

  const updateStatusMutation = useUpdateOrderStatus();

  const { data, isLoading, refetch, isRefetching } = useAdminOrders({
    page,
    page_size: viewMode === 'kanban' ? 50 : 15,
    status: selectedStatus || undefined,
    q: searchQuery.trim() || undefined,
  });

  const orders = data?.results ?? [];

  const handleKanbanAdvance = (order: DashboardOrderListItem, nextStatus: OrderStatus) => {
    updateStatusMutation.mutate({
      orderNumber: order.order_number,
      payload: { status: nextStatus },
    });
  };

  const handleExportOrders = () => {
    if (orders.length === 0) return;
    exportToCsv(
      orders.map((o) => ({
        'Buyurtma #': o.order_number,
        'Mijoz': o.customer_name,
        'Email': o.user_email,
        'Summa': o.total_price,
        'Status': o.status,
        'To\'lov': o.payment_status,
        'Sana': o.created_at,
      })),
      'buyurtmalar_royxati'
    );
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Yetkazildi</Badge>;
      case 'SHIPPED':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Yo'lda</Badge>;
      case 'PROCESSING':
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-200">Yig'ilmoqda</Badge>;
      case 'CONFIRMED':
        return <Badge className="bg-teal-500/10 text-teal-600 border-teal-200">Tasdiqlandi</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Bekor qilindi</Badge>;
      default:
        return <Badge variant="outline">Kutilmoqda</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">To'langan</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-200">Qaytarilgan</Badge>;
      case 'PARTIALLY_REFUNDED':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Qisman</Badge>;
      default:
        return <Badge variant="outline">To'lanmagan</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingBag className="size-7 text-primary" />
            <span>Buyurtmalar Boshqaruvi</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Mijozlarning barcha xaridlari, holatlari, kuryer trek-kodlari va ichki operator eslatmalari.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Ko'rinish rejimi: Jadval / Kanban */}
          <div className="flex items-center rounded-lg border bg-muted/40 p-0.5">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-7 px-2.5 text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <LayoutList className="size-3.5" />
              <span>Jadval</span>
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="h-7 px-2.5 text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <Kanban className="size-3.5" />
              <span>Kanban</span>
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportOrders}
            className="gap-1.5 text-xs font-semibold h-8 cursor-pointer"
            title="CSV ga eksport qilish"
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-1.5 text-xs font-semibold h-8 cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Yangilash</span>
          </Button>
        </div>
      </div>

      {/* Filter Tablari & Qidiruv */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {STATUS_TABS.map((tab) => (
            <Button
              key={tab.value}
              variant={selectedStatus === tab.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setSelectedStatus(tab.value);
                setPage(1);
              }}
              className="text-xs font-semibold whitespace-nowrap"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buyurtma #, ism yoki email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-8 text-xs h-9"
          />
        </div>
      </div>

      {/* Buyurtmalar: Jadval yoki Kanban doskasi */}
      {viewMode === 'kanban' ? (
        <OrdersKanbanBoard
          orders={orders}
          onInspectOrder={(orderNum) => setInspectOrderNumber(orderNum)}
          onUpdateStatus={handleKanbanAdvance}
          isLoading={isLoading}
        />
      ) : (
        <Card className="shadow-2xs border">
          <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Buyurtmalar topilmadi
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                    <th className="py-3 px-4 font-medium font-mono">Buyurtma #</th>
                    <th className="py-3 px-4 font-medium">Mijoz</th>
                    <th className="py-3 px-4 font-medium">Sana & Vaqt</th>
                    <th className="py-3 px-4 font-medium text-center">Tovarlar</th>
                    <th className="py-3 px-4 font-medium text-right">Summa</th>
                    <th className="py-3 px-4 font-medium text-center">Status</th>
                    <th className="py-3 px-4 font-medium text-center">To'lov</th>
                    <th className="py-3 px-4 font-medium text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-foreground">
                        <button
                          onClick={() => setInspectOrderNumber(order.order_number)}
                          className="hover:underline text-primary"
                        >
                          {order.order_number}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-foreground">{order.customer_name}</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                          {order.user_email}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-[10px]">
                          {order.items_count} dona
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-foreground whitespace-nowrap">
                        {formatPrice(Number(order.total_price || 0), { currency: 'UZS' })}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getPaymentBadge(order.payment_status)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.internal_notes_count > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
                              <MessageSquare className="size-3" />
                              {order.internal_notes_count}
                            </span>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInspectOrderNumber(order.order_number)}
                            className="h-7 px-2 text-xs font-semibold gap-1"
                          >
                            <Eye className="size-3" />
                            <span>Ko'rish</span>
                          </Button>

                          <PermissionGate permission="orders:update_status">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setStatusModalOrder(order)}
                              className="h-7 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <Edit className="size-3" />
                              <span>Status</span>
                            </Button>
                          </PermissionGate>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        <AdminPagination
          page={page}
          totalCount={data?.count || 0}
          pageSize={15}
          onPageChange={(newPage) => setPage(newPage)}
          isLoading={isLoading}
        />
      </Card>
      )}

      {/* Buyurtma Tafsilotlari Modali */}
      <OrderDetailModal
        orderNumber={inspectOrderNumber}
        isOpen={Boolean(inspectOrderNumber)}
        onClose={() => setInspectOrderNumber(null)}
      />

      {/* Status Yangilash Modali */}
      <OrderStatusUpdateModal
        orderNumber={statusModalOrder?.order_number || null}
        currentStatus={statusModalOrder?.status}
        isOpen={Boolean(statusModalOrder)}
        onClose={() => setStatusModalOrder(null)}
      />
    </div>
  );
}
