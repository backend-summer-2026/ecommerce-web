'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StaffActivityLog, StaffActionType, StaffModuleType } from '@/types';
import { formatDate } from '@/lib/utils';
import { ShieldCheck, UserCheck, Monitor, Clock } from 'lucide-react';

interface StaffAuditLogsTableProps {
  logs?: StaffActivityLog[];
  isLoading: boolean;
}

export function StaffAuditLogsTable({ logs = [], isLoading }: StaffAuditLogsTableProps) {
  const getActionBadge = (action: StaffActionType) => {
    switch (action) {
      case 'CREATE':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">CREATE</Badge>;
      case 'UPDATE':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">UPDATE</Badge>;
      case 'DELETE':
        return <Badge variant="destructive">DELETE</Badge>;
      case 'STATUS_CHANGE':
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-200">STATUS</Badge>;
      case 'STOCK_ADJUSTMENT':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">STOCK</Badge>;
      case 'REFUND':
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-200">REFUND</Badge>;
      case 'LOGIN':
        return <Badge className="bg-teal-500/10 text-teal-600 border-teal-200">LOGIN</Badge>;
      case 'EXPORT':
        return <Badge variant="outline">EXPORT</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const getModuleBadge = (mod: StaffModuleType) => {
    return (
      <Badge variant="secondary" className="font-mono text-[10px]">
        {mod}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <span>Xodimlar Harakati Auditi (Staff Audit Trail)</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {logs.length} ta hodisa
          </Badge>
        </div>
        <CardDescription>
          Do'kon xodimlari, menejerlar va adminlar tomonidan tizimda amalga oshirilgan barcha harakatlar jurnali
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Audit yozuvlari topilmadi
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                  <th className="py-2.5 px-4 font-medium">Sana & Vaqt</th>
                  <th className="py-2.5 px-4 font-medium">Mas'ul Operator</th>
                  <th className="py-2.5 px-4 font-medium text-center">Modul</th>
                  <th className="py-2.5 px-4 font-medium text-center">Harakat</th>
                  <th className="py-2.5 px-4 font-medium">Obyekt & ID</th>
                  <th className="py-2.5 px-4 font-medium">IP Manzil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <UserCheck className="size-3.5 text-muted-foreground" />
                        <span className="font-semibold text-foreground">{log.actor_email}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      {getModuleBadge(log.module)}
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-muted-foreground">
                      {log.target_model || '—'}
                      {log.target_id && ` #${log.target_id}`}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Monitor className="size-3 text-muted-foreground/60" />
                        <span>{log.ip_address || '127.0.0.1'}</span>
                      </div>
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
