'use client';

import React, { useState } from 'react';
import {
  useEmailQueue,
  useRetryEmail,
  useCancelEmail,
  useNotificationTemplates,
} from '@/features/dashboard/hooks/useDashboard';
import {
  BroadcastNotificationModal,
  TemplateTestSendModal,
} from '@/features/dashboard/components';
import { EmailQueueItem, NotificationTemplate } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import {
  Bell,
  Mail,
  RotateCw,
  X,
  Send,
  RefreshCw,
  Plus,
  Megaphone,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<'EMAILS' | 'TEMPLATES'>('EMAILS');
  const [emailStatusFilter, setEmailStatusFilter] = useState<'FAILED' | 'PENDING' | 'SENT' | ''>('FAILED');
  const [page, setPage] = useState(1);

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [testSendTemplate, setTestSendTemplate] = useState<NotificationTemplate | null>(null);

  const retryEmailMutation = useRetryEmail();
  const cancelEmailMutation = useCancelEmail();

  const {
    data: emailsData,
    isLoading: isEmailsLoading,
    refetch: refetchEmails,
    isRefetching: isEmailsRefetching,
  } = useEmailQueue({
    page,
    page_size: 15,
    status: emailStatusFilter || undefined,
  });

  const {
    data: templatesData,
    isLoading: isTemplatesLoading,
    refetch: refetchTemplates,
  } = useNotificationTemplates({
    page: 1,
    page_size: 50,
  });

  const handleRefresh = () => {
    refetchEmails();
    refetchTemplates();
  };

  const getEmailStatusBadge = (status: EmailQueueItem['status']) => {
    switch (status) {
      case 'SENT':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Yetkazildi (Sent)</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Xatolik (Failed)</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline">Bekor qilingan</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Kutilmoqda (Pending)</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sarlavha & Broadcast tugmasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Bell className="size-7 text-primary" />
            <span>Xabarnomalar Markazi & Email Navbati</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Barcha mijozlarga ommaviy xabarnomalar yo'llash, chiquvchi email navbatini nazorat qilish va shablonlar auditi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`size-3.5 ${isEmailsRefetching ? 'animate-spin' : ''}`} />
            <span>Yangilash</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsBroadcastModalOpen(true)}
            className="gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90"
          >
            <Megaphone className="size-3.5" />
            <span>Yangi Broadcast Tarqatish</span>
          </Button>
        </div>
      </div>

      {/* Tablar */}
      <div className="flex items-center gap-2 border-b pb-3">
        <Button
          variant={activeTab === 'EMAILS' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('EMAILS')}
          className="text-xs font-semibold gap-1.5"
        >
          <Mail className="size-3.5" />
          <span>Email Navbati (Outbound Queue)</span>
          <span className="text-[10px] ml-1 opacity-70">
            ({emailsData?.count ?? '...'})
          </span>
        </Button>

        <Button
          variant={activeTab === 'TEMPLATES' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('TEMPLATES')}
          className="text-xs font-semibold gap-1.5"
        >
          <Bell className="size-3.5" />
          <span>Xabarnoma Shablonlari (Templates)</span>
          <span className="text-[10px] ml-1 opacity-70">
            ({templatesData?.count ?? '...'})
          </span>
        </Button>
      </div>

      {/* 1. Email Navbati */}
      {activeTab === 'EMAILS' && (
        <div className="space-y-4">
          {/* Status filtri */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { label: 'Failed (Xatoliklar)', value: 'FAILED' },
              { label: 'Pending (Navbatda)', value: 'PENDING' },
              { label: 'Sent (Yuborilganlar)', value: 'SENT' },
              { label: 'Barchasi', value: '' },
            ].map((st) => (
              <Button
                key={st.value}
                variant={emailStatusFilter === st.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setEmailStatusFilter(st.value as any);
                  setPage(1);
                }}
                className="text-xs h-7 font-semibold"
              >
                {st.label}
              </Button>
            ))}
          </div>

          <Card>
            <CardContent className="p-0">
              {isEmailsLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              ) : (emailsData?.results ?? []).length === 0 ? (
                <div className="p-12 text-center text-sm text-muted-foreground">
                  Email navbatida yozuvlar topilmadi
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                        <th className="py-3 px-4 font-medium">Qabul Qiluvchi</th>
                        <th className="py-3 px-4 font-medium">Mavzu (Subject)</th>
                        <th className="py-3 px-4 font-medium text-center">Status</th>
                        <th className="py-3 px-4 font-medium text-center">Urinishlar</th>
                        <th className="py-3 px-4 font-medium">Xatolik Izohi</th>
                        <th className="py-3 px-4 font-medium">Yaratilgan</th>
                        <th className="py-3 px-4 font-medium text-right">Amal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {emailsData?.results.map((email) => (
                        <tr key={email.id} className="hover:bg-muted/20">
                          <td className="py-3 px-4 font-semibold text-foreground">
                            {email.recipient_email}
                          </td>
                          <td className="py-3 px-4 max-w-[200px] truncate text-foreground">
                            {email.subject}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {getEmailStatusBadge(email.status)}
                          </td>
                          <td className="py-3 px-4 text-center font-bold">
                            {email.retry_count}
                          </td>
                          <td className="py-3 px-4 text-rose-600 max-w-[200px] truncate text-[11px]">
                            {email.error_message || '—'}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                            {formatDate(email.created_at)}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {email.status === 'FAILED' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => retryEmailMutation.mutate(email.id)}
                                  disabled={retryEmailMutation.isPending}
                                  className="h-7 px-2 text-xs font-semibold gap-1 text-primary hover:border-primary"
                                >
                                  <RotateCw className="size-3" />
                                  <span>Qayta urinish</span>
                                </Button>
                              )}
                              {email.status === 'PENDING' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => cancelEmailMutation.mutate(email.id)}
                                  disabled={cancelEmailMutation.isPending}
                                  className="h-7 px-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
                                >
                                  <X className="size-3" />
                                  <span>Bekor qilish</span>
                                </Button>
                              )}
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
        </div>
      )}

      {/* 2. Shablonlar Ro'yxati */}
      {activeTab === 'TEMPLATES' && (
        <Card>
          <CardContent className="p-0">
            {isTemplatesLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (templatesData?.results ?? []).length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                Shablonlar mavjud emas
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/40 text-muted-foreground text-left">
                      <th className="py-3 px-4 font-medium font-mono">Kod (Code)</th>
                      <th className="py-3 px-4 font-medium">Shablon Nomi</th>
                      <th className="py-3 px-4 font-medium text-center">Toifasi</th>
                      <th className="py-3 px-4 font-medium">Email Mavzusi</th>
                      <th className="py-3 px-4 font-medium text-center">Holat</th>
                      <th className="py-3 px-4 font-medium text-right">Sinov</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {templatesData?.results.map((tpl) => (
                      <tr key={tpl.id} className="hover:bg-muted/20">
                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          {tpl.code}
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {tpl.name}
                          <p className="text-[10px] text-muted-foreground font-normal">
                            {tpl.description}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className="text-[10px]">
                            {tpl.notification_type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground max-w-[220px] truncate">
                          {tpl.email_subject_template || '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {tpl.is_active ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                              Faol
                            </Badge>
                          ) : (
                            <Badge variant="outline">Nofaol</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTestSendTemplate(tpl)}
                            className="h-7 px-2 text-xs font-semibold gap-1"
                          >
                            <Send className="size-3" />
                            <span>Test Send</span>
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

      {/* Broadcast Modali */}
      <BroadcastNotificationModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
      />

      {/* Test Send Modali */}
      <TemplateTestSendModal
        template={testSendTemplate}
        isOpen={Boolean(testSendTemplate)}
        onClose={() => setTestSendTemplate(null)}
      />
    </div>
  );
}
