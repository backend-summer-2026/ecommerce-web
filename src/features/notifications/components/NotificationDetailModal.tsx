'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Calendar,
  ExternalLink,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Info,
  Clock,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationTypeIcon } from './NotificationTypeIcon';
import {
  formatNotificationTime,
  getNotificationTypeLabel,
  getPriorityMeta,
} from '../utils/notificationUtils';
import {
  useNotificationDetail,
  useMarkNotificationRead,
  useMarkNotificationUnread,
  useDeleteNotification,
} from '../hooks/useNotifications';
import type { NotificationItem } from '@/types/notifications';

interface NotificationDetailModalProps {
  notification: NotificationItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDetailModal({
  notification,
  isOpen,
  onClose,
}: NotificationDetailModalProps) {
  const { data: detailData, isLoading } = useNotificationDetail(
    isOpen && notification ? notification.id : undefined
  );
  const markReadMutation = useMarkNotificationRead();
  const markUnreadMutation = useMarkNotificationUnread();
  const deleteMutation = useDeleteNotification();

  // Oyna ochilganda, agar o'qilmagan bo'lsa o'qilgan deb belgilash
  useEffect(() => {
    if (isOpen && notification && !notification.is_read) {
      markReadMutation.mutate(notification.id);
    }
  }, [isOpen, notification?.id, notification?.is_read]);

  if (!isOpen || !notification) return null;

  const currentNotification = detailData || notification;
  const isRead = currentNotification.is_read;
  const priorityMeta = getPriorityMeta(currentNotification.priority);
  const typeLabel = getNotificationTypeLabel(currentNotification.notification_type);

  const handleDelete = async () => {
    if (window.confirm('Haqiqatan ham ushbu xabarnomani o‘chirmoqchimisiz?')) {
      await deleteMutation.mutateAsync(notification.id);
      onClose();
    }
  };

  const handleToggleReadStatus = () => {
    if (isRead) {
      markUnreadMutation.mutate(notification.id);
    } else {
      markReadMutation.mutate(notification.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div
        className="w-full max-w-lg rounded-2xl bg-card border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <NotificationTypeIcon
              type={currentNotification.notification_type}
              size="md"
            />
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {typeLabel}
                </Badge>
                {priorityMeta.isHigh && (
                  <Badge variant="outline" className={priorityMeta.className}>
                    {priorityMeta.label}
                  </Badge>
                )}
                {isRead ? (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-emerald-500" />
                    O'qilgan
                  </span>
                ) : (
                  <span className="text-[11px] text-primary font-medium flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Yangi
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="size-3" />
                {formatNotificationTime(currentNotification.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition"
            aria-label="Yopish"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {currentNotification.title}
            </h3>
            {isLoading && !detailData ? (
              <div className="py-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-muted rounded w-full animate-pulse" />
                <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
              </div>
            ) : (
              <div className="mt-3 text-sm text-foreground/85 leading-relaxed whitespace-pre-line bg-muted/30 p-4 rounded-xl border border-border/50">
                {detailData?.message || 'Batafsil matn mavjud emas.'}
              </div>
            )}
          </div>

          {/* Qo'shimcha ma'lumotlar (data) */}
          {detailData?.data && typeof detailData.data === 'object' && Object.keys(detailData.data).length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Layers className="size-3.5" />
                Bog'liq parametrlar:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(detailData.data).map(([key, val]) => (
                  <div key={key} className="bg-muted/40 p-2 rounded-lg">
                    <span className="text-muted-foreground block text-[11px] uppercase tracking-wider">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="font-semibold text-foreground truncate block">
                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Harakat havolasi (Action URL) */}
          {currentNotification.action_url && (
            <div className="pt-2">
              <Link
                href={currentNotification.action_url}
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition shadow-xs"
              >
                <span>Tegishli sahifaga o'tish</span>
                <ExternalLink className="size-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t px-6 py-3 bg-muted/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleReadStatus}
            disabled={markReadMutation.isPending || markUnreadMutation.isPending}
            className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            <span>{isRead ? 'O‘qilmagan qilish' : 'O‘qilgan qilish'}</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-3.5" />
              <span>O‘chirish</span>
            </Button>
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Yopish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
