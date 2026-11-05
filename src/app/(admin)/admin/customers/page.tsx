'use client';

import React, { useState } from 'react';
import {
  useCustomers,
} from '@/features/dashboard/hooks/useDashboard';
import {
  CustomerDossierModal,
  ToggleCustomerStatusModal,
} from '@/features/dashboard/components';
import { DashboardCustomerListItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  Ban,
  CheckCircle,
  Phone,
  Mail,
  Shield,
} from 'lucide-react';

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const [dossierCustomerId, setDossierCustomerId] = useState<number | null>(null);
  const [toggleCustomer, setToggleCustomer] = useState<DashboardCustomerListItem | null>(null);

  const { data, isLoading, refetch, isRefetching } = useCustomers({
    page,
    page_size: 15,
    q: searchQuery.trim() || undefined,
  });

  const customers = data?.results ?? [];

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Users className="size-7 text-primary" />
            <span>Mijozlar CRM & Foydalanuvchilar</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Ro'yxatdan o'tgan mijozlar, ularning xarid tarixi (LTV), hisob holati va bloklash nazorati.
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

      {/* Qidiruv Paneli */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Ism, familiya, email yoki telefon..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-8 text-xs h-9"
          />
        </div>

        <div className="text-xs text-muted-foreground">
          Jami mijozlar: <span className="font-bold text-foreground">{data?.count ?? '...'}</span> nafar
        </div>
      </div>

      {/* Mijozlar Jadvali */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Mijozlar topilmadi
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                    <th className="py-3 px-4 font-medium">Mijoz</th>
                    <th className="py-3 px-4 font-medium">Email & Telefon</th>
                    <th className="py-3 px-4 font-medium text-center">Roli</th>
                    <th className="py-3 px-4 font-medium text-center">Buyurtmalar</th>
                    <th className="py-3 px-4 font-medium text-right">Jami Sarflangan (LTV)</th>
                    <th className="py-3 px-4 font-medium text-center">Holat</th>
                    <th className="py-3 px-4 font-medium">Ro'yxatdan O'tgan</th>
                    <th className="py-3 px-4 font-medium text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {customers.map((customer) => {
                    const fullName = [customer.first_name, customer.last_name]
                      .filter(Boolean)
                      .join(' ') || 'Noma\'lum mijoz';

                    const initial = (customer.first_name || customer.email || 'U')
                      .charAt(0)
                      .toUpperCase();

                    return (
                      <tr key={customer.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-full bg-purple-500/10 text-purple-600 font-bold flex items-center justify-center text-xs shrink-0">
                              {initial}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{fullName}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">
                                ID: #{customer.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-foreground">{customer.email}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {customer.phone_number || 'Telefon kiritilmagan'}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className="text-[10px] uppercase font-mono">
                            {customer.role || 'customer'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          {customer.total_orders_count} ta
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                          {formatPrice(Number(customer.total_spent || 0), { currency: 'UZS' })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {customer.is_active ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                              Faol
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Bloklangan</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {formatDate(customer.created_at)}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDossierCustomerId(customer.id)}
                              className="h-7 px-2 text-xs font-semibold gap-1"
                            >
                              <Eye className="size-3" />
                              <span>Dosye</span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setToggleCustomer(customer)}
                              className={`h-7 px-2 text-xs font-semibold ${
                                customer.is_active
                                  ? 'text-destructive hover:bg-destructive/10'
                                  : 'text-emerald-600 hover:bg-emerald-500/10'
                              }`}
                            >
                              {customer.is_active ? (
                                <>
                                  <Ban className="size-3" />
                                  <span>Blok</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="size-3" />
                                  <span>Faol</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mijoz Dosyesi Modali */}
      <CustomerDossierModal
        customerId={dossierCustomerId}
        isOpen={Boolean(dossierCustomerId)}
        onClose={() => setDossierCustomerId(null)}
      />

      {/* Bloklash / Faollashtirish Modali */}
      <ToggleCustomerStatusModal
        customer={toggleCustomer}
        isOpen={Boolean(toggleCustomer)}
        onClose={() => setToggleCustomer(null)}
      />
    </div>
  );
}
