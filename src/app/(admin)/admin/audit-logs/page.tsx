'use client';

import React, { useState } from 'react';
import {
  useStaffAuditLogs,
} from '@/features/dashboard/hooks/useDashboard';
import {
  StaffAuditLogsTable,
} from '@/features/dashboard/components';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminPagination } from '@/components/ui/AdminPagination';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { StaffModuleType, StaffActionType } from '@/types';

const MODULES: Array<{ label: string; value: string }> = [
  { label: 'Barcha Modullar', value: '' },
  { label: 'Buyurtmalar (Orders)', value: 'ORDERS' },
  { label: 'Ombor & Zaxira (Inventory)', value: 'INVENTORY' },
  { label: 'Mahsulotlar (Products)', value: 'PRODUCTS' },
  { label: 'Mijozlar (Users)', value: 'USERS' },
  { label: "To'lovlar (Payments)", value: 'PAYMENTS' },
  { label: 'Sharhlar (Reviews)', value: 'REVIEWS' },
  { label: 'Sozlamalar (Settings)', value: 'SETTINGS' },
];

export default function AdminAuditLogsPage() {
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isRefetching } = useStaffAuditLogs({
    page,
    page_size: 25,
    module: selectedModule || undefined,
    action: selectedAction || undefined,
    q: searchQuery.trim() || undefined,
  });

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="size-7 text-primary" />
            <span>Xodimlar Harakati Auditi (Audit Trail)</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Do'kon xodimlari, menejerlar va adminlarning har bir operatsiyasi, status o'zgarishi, to'g'rilashlari va IP manzillari jurnali.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="gap-1.5 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className={`size-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          <span>Yangilash</span>
        </Button>
      </div>

      {/* Filterlar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Modul tanlagich */}
          <select
            value={selectedModule}
            onChange={(e) => {
              setSelectedModule(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          >
            {MODULES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Harakat turi */}
          <select
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          >
            <option value="">Barcha Harakatlar</option>
            <option value="CREATE">CREATE - Yaratish</option>
            <option value="UPDATE">UPDATE - Yangilash</option>
            <option value="DELETE">DELETE - O'chirish</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE - Status o'zgartirish</option>
            <option value="STOCK_ADJUSTMENT">STOCK_ADJUSTMENT - Zaxirani to'g'rilash</option>
            <option value="REFUND">REFUND - Mablag' qaytarish</option>
            <option value="LOGIN">LOGIN - Tizimga kirish</option>
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Operator email, target ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-8 text-xs h-9"
          />
        </div>
      </div>

      {/* Audit Jadvali */}
      <div className="space-y-0 border rounded-xl overflow-hidden bg-card">
        <StaffAuditLogsTable
          logs={data?.results}
          isLoading={isLoading}
        />
        <AdminPagination
          page={page}
          totalCount={data?.count || 0}
          pageSize={25}
          onPageChange={(newPage) => setPage(newPage)}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
