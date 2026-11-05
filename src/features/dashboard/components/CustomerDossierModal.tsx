'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  ShoppingBag,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  Shield,
  Ban,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCustomerDetail } from '../hooks/useDashboard';
import { formatPrice, formatDate } from '@/lib/utils';
import { ToggleCustomerStatusModal } from './ToggleCustomerStatusModal';
import { DashboardCustomerRecentOrder } from '@/types';

interface CustomerDossierModalProps {
  customerId: number | string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerDossierModal({
  customerId,
  isOpen,
  onClose,
}: CustomerDossierModalProps) {
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);

  const { data: customer, isLoading } = useCustomerDetail(customerId || '');

  if (!isOpen || !customerId) return null;

  // recent_orders backendda json yoki array bo'lishi mumkin
  const recentOrders: DashboardCustomerRecentOrder[] = Array.isArray(customer?.recent_orders)
    ? customer.recent_orders
    : [];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border bg-card p-6 shadow-xl animate-in fade-in-50 zoom-in-95">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>

          {/* Modal Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-purple-500/10 text-purple-600 font-bold flex items-center justify-center text-lg">
                {(customer?.first_name || customer?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">
                    {customer?.first_name || customer?.last_name
                      ? `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim()
                      : customer?.email}
                  </h2>
                  {customer?.is_active ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                      Faol
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Bloklangan</Badge>
                  )}
                  {customer?.is_staff && (
                    <Badge variant="outline" className="text-primary font-semibold">
                      Staff / Admin
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  ID: #{customerId} • Ro'yxatdan o'tgan: {customer ? formatDate(customer.created_at) : '...'}
                </p>
              </div>
            </div>

            <Button
              variant={customer?.is_active ? 'destructive' : 'default'}
              size="sm"
              onClick={() => setIsToggleModalOpen(true)}
              className="gap-1.5 text-xs font-semibold"
            >
              {customer?.is_active ? (
                <>
                  <Ban className="size-3.5" />
                  <span>Bloklash</span>
                </>
              ) : (
                <>
                  <CheckCircle className="size-3.5" />
                  <span>Faollashtirish</span>
                </>
              )}
            </Button>
          </div>

          {isLoading ? (
            <div className="py-8 space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : !customer ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Mijoz ma'lumotlari topilmadi
            </div>
          ) : (
            <div className="mt-5 space-y-6">
              {/* Aloqa va KPI lari */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg border bg-muted/20 space-y-2 text-xs">
                  <div className="font-semibold text-foreground border-b pb-1.5 flex items-center gap-1.5">
                    <User className="size-3.5 text-primary" />
                    <span>Aloqa Ma'lumotlari</span>
                  </div>
                  <div className="space-y-1 text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Mail className="size-3" />
                      <span className="font-medium text-foreground">{customer.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="size-3" />
                      <span className="font-medium text-foreground">
                        {customer.phone_number || 'Mavjud emas'}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Shield className="size-3" />
                      <span>Roli: {customer.role || 'customer'}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-muted/20 space-y-2 text-xs">
                  <div className="font-semibold text-foreground border-b pb-1.5 flex items-center gap-1.5">
                    <CreditCard className="size-3.5 text-primary" />
                    <span>Xarid Faolligi (LTV)</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Jami buyurtmalar:</span>
                      <span className="font-bold text-foreground">
                        {customer.total_orders_count} ta
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Jami sarflangan (LTV):</span>
                      <span className="font-bold text-emerald-600 text-sm">
                        {formatPrice(Number(customer.total_spent || 0), { currency: 'UZS' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* So'nggi buyurtmalar */}
              <div className="border rounded-lg overflow-hidden">
                <div className="p-3 bg-muted/40 font-semibold text-xs flex items-center gap-2 border-b">
                  <ShoppingBag className="size-4 text-primary" />
                  <span>Mijozning So'nggi Buyurtmalari</span>
                </div>
                {recentOrders.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    Hozircha buyurtmalar mavjud emas
                  </div>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/20 text-muted-foreground text-left">
                        <th className="py-2 px-3 font-medium">Buyurtma #</th>
                        <th className="py-2 px-3 font-medium text-center">Status</th>
                        <th className="py-2 px-3 font-medium text-right">Summa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentOrders.map((ord, i) => (
                        <tr key={i} className="hover:bg-muted/20">
                          <td className="py-2 px-3 font-mono font-medium text-foreground">
                            {ord.order_number}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Badge variant="outline" className="text-[10px]">
                              {ord.status}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-foreground">
                            {formatPrice(Number(ord.total_price || 0), { currency: 'UZS' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bloklash / Faollashtirish Modali */}
      <ToggleCustomerStatusModal
        customer={customer || null}
        isOpen={isToggleModalOpen}
        onClose={() => setIsToggleModalOpen(false)}
      />
    </>
  );
}
