'use client';

import React, { useState } from 'react';
import {
  useInventory,
  useLowStock,
  useInventoryStats,
  useStockLogs,
} from '@/features/dashboard/hooks/useDashboard';
import {
  AdjustStockModal,
  StockMovementLogsTable,
} from '@/features/dashboard/components';
import { DashboardInventoryItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';
import {
  Package,
  AlertTriangle,
  Search,
  Plus,
  RefreshCw,
  History,
  Archive,
  Layers,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';

export default function AdminInventoryPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'LOW_STOCK' | 'LOGS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<DashboardInventoryItem | null>(null);

  // Stats
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useInventoryStats();

  // All stocks
  const {
    data: inventoryData,
    isLoading: isInventoryLoading,
    refetch: refetchInventory,
  } = useInventory({
    page,
    page_size: 15,
    q: searchQuery.trim() || undefined,
  });

  // Low stock items
  const {
    data: lowStockData,
    isLoading: isLowStockLoading,
    refetch: refetchLowStock,
  } = useLowStock({ page: 1, page_size: 50 });

  // Movement logs
  const {
    data: logsData,
    isLoading: isLogsLoading,
    refetch: refetchLogs,
  } = useStockLogs({ page: 1, page_size: 25 });

  const handleRefresh = () => {
    refetchStats();
    refetchInventory();
    refetchLowStock();
    refetchLogs();
  };

  const getStockBadge = (item: DashboardInventoryItem) => {
    if (item.is_out_of_stock || (item.available_quantity ?? item.quantity) <= 0) {
      return <Badge variant="destructive">Tugagan (0)</Badge>;
    }
    if (item.is_low_stock || (item.available_quantity ?? item.quantity) <= (item.low_stock_threshold || 5)) {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-300">
          Kam qolgan ({item.available_quantity ?? item.quantity})
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-300">
        Mavjud ({item.available_quantity ?? item.quantity})
      </Badge>
    );
  };

  const displayedList = activeTab === 'LOW_STOCK'
    ? lowStockData?.results ?? []
    : inventoryData?.results ?? [];

  const isCurrentLoading = activeTab === 'LOW_STOCK' ? isLowStockLoading : isInventoryLoading;

  return (
    <div className="space-y-6">
      {/* Sarlavha & Yangilash */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Package className="size-7 text-primary" />
            <span>Ombor & Zaxiralar Boshqaruvi</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Barcha tovar variantlari qoldig'i, kam qolgan tovarlar monitoringi va kirim-chiqim auditi.
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

      {/* 1. Ombor Statistika Kartalari */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Jami Zaxira Birligi
            </CardTitle>
            <Archive className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.total_units_in_stock?.toLocaleString('uz-UZ') || 0} dona
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">
              {stats?.total_variants_count || 0} xil SKU bo'yicha
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Band Qilingan (Reserved)
            </CardTitle>
            <Layers className="size-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-2xl font-bold text-purple-600">
                {stats?.total_units_reserved?.toLocaleString('uz-UZ') || 0} dona
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">
              Faol buyurtmalarga ajratilgan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Kam Qolgan Tovar (Low Stock)
            </CardTitle>
            <AlertTriangle className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-2xl font-bold text-amber-600">
                {stats?.low_stock_variants_count || 0} ta SKU
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">
              Chegaradan kamayib ketgan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Tugagan Tovar (Out of Stock)
            </CardTitle>
            <Package className="size-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-2xl font-bold text-destructive">
                {stats?.out_of_stock_variants_count || 0} ta SKU
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">
              Zudlik bilan to'ldirish zarur
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Tablar va Qidiruv */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          <Button
            variant={activeTab === 'ALL' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('ALL')}
            className="text-xs font-semibold gap-1.5"
          >
            <Layers className="size-3.5" />
            <span>Barcha Mahsulotlar</span>
            <span className="text-[10px] ml-1 opacity-70">
              ({inventoryData?.count ?? '...'})
            </span>
          </Button>

          <Button
            variant={activeTab === 'LOW_STOCK' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('LOW_STOCK')}
            className="text-xs font-semibold gap-1.5"
          >
            <AlertTriangle className="size-3.5 text-amber-500" />
            <span>Kam Qolganlar</span>
            <Badge variant="destructive" className="ml-1 text-[10px] py-0 px-1.5">
              {stats?.low_stock_variants_count ?? 0}
            </Badge>
          </Button>

          <Button
            variant={activeTab === 'LOGS' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('LOGS')}
            className="text-xs font-semibold gap-1.5"
          >
            <History className="size-3.5" />
            <span>Harakatlar Auditi</span>
          </Button>
        </div>

        {activeTab !== 'LOGS' && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="SKU yoki mahsulot nomi..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-8 text-xs h-9"
            />
          </div>
        )}
      </div>

      {/* 3. Jadval yoki Audit Jurnali */}
      {activeTab === 'LOGS' ? (
        <StockMovementLogsTable
          logs={logsData?.results}
          isLoading={isLogsLoading}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            {isCurrentLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : displayedList.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                Tovarlar topilmadi
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                      <th className="py-3 px-4 font-medium">Mahsulot Nomi</th>
                      <th className="py-3 px-4 font-medium font-mono">SKU</th>
                      <th className="py-3 px-4 font-medium text-right">Narxi</th>
                      <th className="py-3 px-4 font-medium text-center">Jami Qoldiq</th>
                      <th className="py-3 px-4 font-medium text-center">Band (Reserved)</th>
                      <th className="py-3 px-4 font-medium text-center">Mavjud (Available)</th>
                      <th className="py-3 px-4 font-medium text-center">Holat</th>
                      <th className="py-3 px-4 font-medium text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {displayedList.map((item) => (
                      <tr key={item.id || item.variant_id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-foreground">{item.product_name}</p>
                          <p className="text-[10px] text-muted-foreground">ID: #{item.product_id}</p>
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground font-medium">
                          {item.sku}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-foreground">
                          {formatPrice(Number(item.price || 0), { currency: 'UZS' })}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-foreground">
                          {item.quantity ?? 0}
                        </td>
                        <td className="py-3 px-4 text-center text-purple-600 font-medium">
                          {item.reserved_quantity ?? 0}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-600">
                          {item.available_quantity ?? item.quantity ?? 0}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStockBadge(item)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedItemForAdjust(item)}
                            className="h-7 text-xs font-semibold gap-1 hover:border-primary hover:text-primary"
                          >
                            <SlidersHorizontal className="size-3" />
                            <span>Tuzatish</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tuzatish Modali */}
      <AdjustStockModal
        item={selectedItemForAdjust}
        isOpen={Boolean(selectedItemForAdjust)}
        onClose={() => setSelectedItemForAdjust(null)}
      />
    </div>
  );
}
