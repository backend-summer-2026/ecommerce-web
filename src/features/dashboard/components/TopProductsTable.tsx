'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TopProduct } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Package, Trophy } from 'lucide-react';

interface TopProductsTableProps {
  products?: TopProduct[];
  isLoading: boolean;
}

export function TopProductsTable({ products = [], isLoading }: TopProductsTableProps) {
  return (
    <Card className="col-span-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Trophy className="size-4 text-amber-500" />
            <span>Eng Ko'p Sotilgan Mahsulotlar</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Top {products.length}
          </Badge>
        </div>
        <CardDescription>Sotuv hajmi va daromadi bo'yicha yetakchilar</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-md" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Mahsulotlar topilmadi
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="py-2.5 px-4 text-left font-medium w-8">#</th>
                  <th className="py-2.5 px-4 text-left font-medium">Mahsulot</th>
                  <th className="py-2.5 px-4 text-center font-medium">Sotilgan</th>
                  <th className="py-2.5 px-4 text-right font-medium">Jami Tushum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((item, idx) => (
                  <tr key={item.product_id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4 text-muted-foreground font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Package className="size-3.5" />
                        </div>
                        <div className="truncate max-w-[180px] sm:max-w-[220px]">
                          <p className="font-semibold text-foreground truncate">
                            {item.product_name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {item.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-center font-semibold text-foreground">
                      {item.total_sold} dona
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-600">
                      {formatPrice(Number(item.total_revenue || 0), { currency: 'UZS' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
