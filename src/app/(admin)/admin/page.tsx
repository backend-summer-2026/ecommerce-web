'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  KPICardsGrid,
  SalesDynamicsChart,
  TopProductsTable,
  TopCustomersTable,
  BroadcastNotificationModal,
} from '@/features/dashboard';
import {
  useKPIOverview,
  useSalesChart,
  useTopProducts,
  useTopCustomers,
} from '@/features/dashboard/hooks/useDashboard';
import { Button } from '@/components/ui/button';
import {
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  Bell,
  RefreshCw,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [days, setDays] = useState<number>(30);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ fromDate?: string; toDate?: string }>({});

  React.useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    setDateRange({ fromDate, toDate: today });
  }, [days]);

  const {
    data: kpiData,
    isLoading: isKpiLoading,
    refetch: refetchKpi,
    isRefetching: isKpiRefetching,
  } = useKPIOverview(dateRange.fromDate, dateRange.toDate);

  const {
    data: salesChartData,
    isLoading: isSalesLoading,
    refetch: refetchSales,
  } = useSalesChart(days);

  const {
    data: topProductsData,
    isLoading: isTopProductsLoading,
  } = useTopProducts(6);

  const {
    data: topCustomersData,
    isLoading: isTopCustomersLoading,
  } = useTopCustomers(6);

  const handleRefresh = () => {
    refetchKpi();
    refetchSales();
  };

  return (
    <div className="space-y-6">
      {/* Sahifa Yuqori Qismi & Harakatlar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>Boshqaruv Tahlillari & KPI</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Do'konning real vaqtdagi daromadlari, buyurtmalar oqimi va muhim operatsion ko'rsatkichlari.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isKpiRefetching}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`size-3.5 ${isKpiRefetching ? 'animate-spin' : ''}`} />
            <span>Yangilash</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsBroadcastModalOpen(true)}
            className="gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90"
          >
            <Bell className="size-3.5" />
            <span>Broadcast Xabar</span>
          </Button>
        </div>
      </div>

      {/* 1. Asosiy KPI Ko'rsatkichlari */}
      <KPICardsGrid data={kpiData} isLoading={isKpiLoading} />

      {/* 2. Savdo Dinamikasi Grafigi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesDynamicsChart
          data={salesChartData}
          isLoading={isSalesLoading}
          days={days}
          onDaysChange={setDays}
        />

        {/* Tezkor Bo'limlarga O'tish & Holat */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl border bg-card space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <span>Tezkor Amallar va Bo'limlar</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/admin/orders">
                <div className="p-3.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center">
                      <ShoppingBag className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Buyurtmalar</p>
                      <p className="text-[10px] text-muted-foreground">Status & tracking</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              <Link href="/admin/inventory">
                <div className="p-3.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center">
                      <Package className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Ombor Zaxiralari</p>
                      <p className="text-[10px] text-muted-foreground">Kirim / chiqim</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              <Link href="/admin/customers">
                <div className="p-3.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-md bg-purple-500/10 text-purple-600 flex items-center justify-center">
                      <Users className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Mijozlar CRM</p>
                      <p className="text-[10px] text-muted-foreground">LTV & profiling</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              <Link href="/admin/payments">
                <div className="p-3.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <CreditCard className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">To'lovlar & Qaytarish</p>
                      <p className="text-[10px] text-muted-foreground">Refund monitoring</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Top Mahsulotlar & Top Mijozlar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsTable
          products={topProductsData}
          isLoading={isTopProductsLoading}
        />
        <TopCustomersTable
          customers={topCustomersData}
          isLoading={isTopCustomersLoading}
        />
      </div>

      {/* Broadcast Modal */}
      <BroadcastNotificationModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
      />
    </div>
  );
}
