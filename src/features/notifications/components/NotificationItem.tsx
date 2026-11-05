'use client';

import React from 'react';
import Link from 'next/link';
import {
  Check,
  RotateCcw,
  Trash2,
  ExternalLink,
  ChevronRight,
  MoreVertical,
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
  useMarkNotificationRead,
  useMarkNotificationUnread,
  useDeleteNotification,
} from '../hooks/useNotifications';
import type { NotificationItem as NotificationItemType } from '@/types/notifications';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: NotificationItemType;
  mode?: 'popover' | 'full';
  onClick?: () => void;
}

export function NotificationItem({
  notification,
  mode = 'full',
  onClick,
}: NotificationItemProps) {
  const markReadMutation = useMarkNotificationRead();
  const markUnreadMutation = useMarkNotificationUnread();
  const deleteMutation = useDeleteNotification();

  const priorityMeta = getPriorityMeta(notification.priority);
  const typeLabel = getNotificationTypeLabel(notification.notification_type);

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.is_read) {
      markUnreadMutation.mutate(notification.id);
    } else {
      markReadMutation.mutate(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Ushbu xabarnomani o‘chirmoqchimisiz?')) {
      deleteMutation.mutate(notification.id);
    }
  };

  if (mode === 'popover') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
        className={cn(
          'w-full text-left p-3.5 flex items-start gap-3 rounded-xl transition hover:bg-muted/70 cursor-pointer border border-transparent',
          !notification.is_read && 'bg-primary/5 border-primary/10 font-medium'
        )}
      >
        <NotificationTypeIcon
          type={notification.notification_type}
          size="sm"
          className="mt-0.5"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-foreground truncate">
              {notification.title}
            </span>
            {!notification.is_read && (
              <span className="size-2 rounded-full bg-primary shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
            <span>{typeLabel}</span>
            <span>•</span>
            <span>{formatNotificationTime(notification.created_at)}</span>
            {priorityMeta.isHigh && (
              <>
                <span>•</span>
                <span className={cn('text-[10px] font-semibold', priorityMeta.className)}>
                  {priorityMeta.label}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full page view
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all cursor-pointer',
        notification.is_read
          ? 'bg-card hover:bg-muted/40 border-border/70 text-muted-foreground'
          : 'bg-primary/[0.03] hover:bg-primary/[0.06] border-primary/20 shadow-xs'
      )}
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        <NotificationTypeIcon
          type={notification.notification_type}
          size="md"
          className="mt-0.5"
        />

        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              className={cn(
                'text-sm truncate max-w-md',
                notification.is_read
                  ? 'font-medium text-foreground/80'
                  : 'font-bold text-foreground'
              )}
            >
              {notification.title}
            </h4>

            <Badge variant="outline" className="text-[10px] px-2 py-0 h-5">
              {typeLabel}
            </Badge>

            {priorityMeta.isHigh && (
              <Badge
                variant="outline"
                className={cn('text-[10px] px-2 py-0 h-5', priorityMeta.className)}
              >
                {priorityMeta.label}
              </Badge>
            )}

            {!notification.is_read && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                Yangi
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatNotificationTime(notification.created_at)}</span>
            {notification.read_at && (
              <>
                <span>•</span>
                <span className="text-[11px]">
                  O'qildi: {formatNotificationTime(notification.read_at)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Harakatlar (Buttons) */}
      <div
        className="flex items-center gap-2 self-end sm:self-center shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {notification.action_url && (
          <Link
            href={notification.action_url}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition"
            title="Sahifaga o'tish"
          >
            <span>O'tish</span>
            <ExternalLink className="size-3" />
          </Link>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleRead}
          disabled={markReadMutation.isPending || markUnreadMutation.isPending}
          className="size-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
          title={notification.is_read ? 'O‘qilmagan deb belgilash' : 'O‘qilgan deb belgilash'}
        >
          {notification.is_read ? (
            <RotateCcw className="size-4" />
          ) : (
            <Check className="size-4 text-emerald-600" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="size-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title="O‘chirish"
        >
          <Trash2 className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClick}
          className="size-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
          title="Batafsil ko'rish"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
