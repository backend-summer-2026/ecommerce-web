'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StockMovementLog, StockMovementType } from '@/types';
import { formatDate } from '@/lib/utils';
import { History, ArrowUpRight, ArrowDownRight, RefreshCw, AlertOctagon } from 'lucide-react';

interface StockMovementLogsTableProps {
  logs?: StockMovementLog[];
  isLoading: boolean;
}

export function StockMovementLogsTable({ logs = [], isLoading }: StockMovementLogsTableProps) {
  const getMovementBadge = (type: StockMovementType, delta: number) => {
    switch (type) {
      case 'INCOMING':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200 gap-1 text-[11px]">
            <ArrowUpRight className="size-3" />
            <span>Kirim (+{delta})</span>
          </Badge>
        );
      case 'OUTGOING':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200 gap-1 text-[11px]">
            <ArrowDownRight className="size-3" />
            <span>Chiqim ({delta})</span>
          </Badge>
        );
      case 'ADJUSTMENT':
        return (
          <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-200 gap-1 text-[11px]">
            <RefreshCw className="size-3" />
            <span>Tuzatish ({delta > 0 ? `+${delta}` : delta})</span>
          </Badge>
        );
      case 'DAMAGED':
        return (
          <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-200 gap-1 text-[11px]">
            <AlertOctagon className="size-3" />
            <span>Brak / Yaroqsiz ({delta})</span>
          </Badge>
        );
      case 'RETURN':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200 gap-1 text-[11px]">
            <ArrowUpRight className="size-3" />
            <span>Mijoz Qaytardi (+{delta})</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[11px]">
            {type} ({delta})
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <History className="size-4 text-primary" />
            <span>Ombor Harakatlari Auditi</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Jami: {logs.length} ta yozuv
          </Badge>
        </div>
        <CardDescription>
          Har bir tovar kirimi, chiqimi, inventarizatsiyasi va mas'ul xodimlar auditi
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Harakatlar tarixi topilmadi
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground">
                  <th className="py-2.5 px-4 text-left font-medium">Sana & Vaqt</th>
                  <th className="py-2.5 px-4 text-left font-medium">Mahsulot & SKU</th>
                  <th className="py-2.5 px-4 text-center font-medium">Harakat Turi</th>
                  <th className="py-2.5 px-4 text-center font-medium">Oldingi -&gt; Yangi</th>
                  <th className="py-2.5 px-4 text-left font-medium">Mas'ul Operator</th>
                  <th className="py-2.5 px-4 text-left font-medium">Sabab / Izoh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="max-w-[200px] truncate">
                        <p className="font-semibold text-foreground truncate">
                          {log.product_name}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {log.variant_sku}
                        </p>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      {getMovementBadge(log.movement_type, log.quantity_delta)}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono whitespace-nowrap">
                      <span className="text-muted-foreground">{log.previous_quantity}</span>
                      <span className="mx-1.5 text-muted-foreground">➔</span>
                      <span className="font-bold text-foreground">{log.new_quantity}</span>
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground truncate max-w-[150px]">
                      {log.actor_email}
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground">
                      {log.reason || (
                        <span className="text-muted-foreground/40 italic">Mavjud emas</span>
                      )}
                      {log.reference_order_number && (
                        <span className="ml-1 text-[10px] font-mono text-primary font-semibold">
                          ({log.reference_order_number})
                        </span>
                      )}
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
