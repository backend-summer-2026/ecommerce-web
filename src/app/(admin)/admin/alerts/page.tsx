'use client';

import React, { useState } from 'react';
import {
  useSystemAlerts,
  useResolveSystemAlert,
} from '@/features/dashboard/hooks/useDashboard';
import { SystemAlert, AlertSeverity } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  RefreshCw,
  ShieldAlert,
  Clock,
  UserCheck,
} from 'lucide-react';

export default function AdminAlertsPage() {
  const [resolvedFilter, setResolvedFilter] = useState<boolean | undefined>(false);
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | ''>('');
  const [page, setPage] = useState(1);

  const resolveMutation = useResolveSystemAlert();

  const { data, isLoading, refetch, isRefetching } = useSystemAlerts({
    page,
    page_size: 20,
    is_resolved: resolvedFilter,
    severity: severityFilter || undefined,
  });

  const alerts = data?.results ?? [];

  const getSeverityBadge = (sev: AlertSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <Badge variant="destructive" className="gap-1 font-bold">
            <AlertCircle className="size-3" />
            <span>CRITICAL</span>
          </Badge>
        );
      case 'WARNING':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-300 gap-1 font-bold">
            <AlertTriangle className="size-3" />
            <span>WARNING</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Info className="size-3 text-blue-500" />
            <span>INFO</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <AlertTriangle className="size-7 text-amber-500" />
            <span>Tizim Operatsion Ogohlantirishlari (Alerts)</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Zaxira tugashi, to'lov xatoliklari, yuqori faollik va texnik nosozliklar monitoringi.
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Button
            variant={resolvedFilter === false ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setResolvedFilter(false);
              setPage(1);
            }}
            className="text-xs font-semibold gap-1.5"
          >
            <ShieldAlert className="size-3.5 text-amber-500" />
            <span>Faol Ogohlantirishlar</span>
          </Button>

          <Button
            variant={resolvedFilter === true ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setResolvedFilter(true);
              setPage(1);
            }}
            className="text-xs font-semibold gap-1.5"
          >
            <CheckCircle className="size-3.5 text-emerald-500" />
            <span>Bartaraf Etilganlar</span>
          </Button>

          <Button
            variant={resolvedFilter === undefined ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setResolvedFilter(undefined);
              setPage(1);
            }}
            className="text-xs font-semibold"
          >
            Barchasi
          </Button>
        </div>

        {/* Severity tanlagich */}
        <div className="flex items-center gap-1">
          {['', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
            <Button
              key={sev}
              variant={severityFilter === sev ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => {
                setSeverityFilter(sev as any);
                setPage(1);
              }}
              className="text-[11px] h-7 px-2 font-medium"
            >
              {sev || 'Barcha Darajalar'}
            </Button>
          ))}
        </div>
      </div>

      {/* Ogohlantirishlar Ro'yxati */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-12 w-full" />
            </Card>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">
          Ogohlantirishlar mavjud emas
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`p-5 transition-all ${
                alert.is_resolved
                  ? 'opacity-70 bg-muted/20'
                  : alert.severity === 'CRITICAL'
                  ? 'border-destructive/40 bg-destructive/5'
                  : 'border-border'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <div className="flex items-center gap-2.5">
                  {getSeverityBadge(alert.severity)}
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {alert.alert_type_display || alert.alert_type}
                  </Badge>
                  <h3 className="font-bold text-sm text-foreground">{alert.title}</h3>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {formatDate(alert.created_at)}
                  </span>
                </div>
              </div>

              <div className="py-3 text-xs text-muted-foreground leading-relaxed">
                {alert.message}
              </div>

              <div className="flex items-center justify-between border-t pt-3 text-xs">
                <div>
                  {alert.is_resolved ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                      <CheckCircle className="size-3.5" />
                      <span>
                        Bartaraf etilgan ({alert.resolved_by_email || 'Operator'}) • {alert.resolved_at ? formatDate(alert.resolved_at) : ''}
                      </span>
                    </span>
                  ) : (
                    <span className="text-amber-600 font-semibold flex items-center gap-1 text-[11px]">
                      <AlertCircle className="size-3.5" />
                      <span>Harakat talab etiladi</span>
                    </span>
                  )}
                </div>

                {!alert.is_resolved && (
                  <Button
                    size="sm"
                    onClick={() => resolveMutation.mutate(alert.id)}
                    disabled={resolveMutation.isPending}
                    className="h-7 text-xs font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle className="size-3.5" />
                    <span>Bartaraf etildi deb belgilash</span>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
