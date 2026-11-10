'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TopCustomer } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Users, Crown } from 'lucide-react';

interface TopCustomersTableProps {
  customers?: TopCustomer[];
  isLoading: boolean;
}

export function TopCustomersTable({ customers = [], isLoading }: TopCustomersTableProps) {
  return (
    <Card className="col-span-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Crown className="size-4 text-purple-500" />
            <span>Eng Katta Xaridorlar (VIP)</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Top {customers.length}
          </Badge>
        </div>
        <CardDescription>Do'konda eng ko'p xarid qilgan mijozlar</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Mijozlar ma'lumotlari mavjud emas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="py-2.5 px-4 text-left font-medium w-8">#</th>
                  <th className="py-2.5 px-4 text-left font-medium">Mijoz</th>
                  <th className="py-2.5 px-4 text-center font-medium">Buyurtmalar</th>
                  <th className="py-2.5 px-4 text-right font-medium">Jami Xarid (LTV)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map((c, idx) => {
                  const initial = (c.name || c.email || 'U').charAt(0).toUpperCase();
                  return (
                    <tr key={c.customer_id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-4 text-muted-foreground font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-full bg-purple-500/10 text-purple-600 font-bold flex items-center justify-center shrink-0 text-xs">
                            {initial}
                          </div>
                          <div className="truncate max-w-[170px] sm:max-w-[210px]">
                            <p className="font-semibold text-foreground truncate">
                              {c.name || 'Noma\'lum mijoz'}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {c.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <Badge variant="secondary" className="text-[10px] font-medium">
                          {c.total_orders} ta
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-foreground">
                        {formatPrice(Number(c.total_spent || 0), { currency: 'UZS' })}
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
  );
}
