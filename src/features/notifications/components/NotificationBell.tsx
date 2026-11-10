'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  Settings,
  ArrowRight,
  Inbox,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useNotificationUnreadCount,
  useNotifications,
  useMarkAllNotificationsRead,
} from '../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { NotificationDetailModal } from './NotificationDetailModal';
import type { NotificationItem as NotificationItemType } from '@/types/notifications';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItemType | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const { data: counters } = useNotificationUnreadCount();
  const unreadCount = counters?.unread_count ?? 0;
  const urgentCount = counters?.urgent_count ?? 0;

  const { data: notificationsData, isLoading } = useNotifications(
    {
      page: 1,
      page_size: 8,
      is_read: activeTab === 'unread' ? false : undefined,
    },
    { enabled: isOpen }
  );

  const markAllReadMutation = useMarkAllNotificationsRead();

  // Popoverdan tashqariga bosilganda uni yopish
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Esc bosilganda yopish
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    if (unreadCount > 0) {
      await markAllReadMutation.mutateAsync();
    }
  };

  const handleNotificationClick = (item: NotificationItemType) => {
    setSelectedNotification(item);
  };

  const items = notificationsData?.results || [];

  return (
    <>
      <div className="relative" ref={popoverRef}>
        {/* Qo'ng'iroqcha tugmasi */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            'relative cursor-pointer transition rounded-full hover:bg-muted',
            isOpen && 'bg-muted text-primary'
          )}
          title="Xabarnomalar"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Bell className="size-5" />

          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold text-white shadow-xs',
                urgentCount > 0
                  ? 'bg-red-600 animate-pulse'
                  : 'bg-primary'
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>

        {/* Popover oynasi */}
        {isOpen && (
          <div
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border bg-popover text-popover-foreground shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
            role="region"
            aria-label="Xabarnomalar darchasi"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">Xabarnomalar</span>
                {unreadCount > 0 && (
                  <Badge variant="default" className="text-[10px] h-4.5 px-1.5 rounded-full">
                    {unreadCount} ta yangi
                  </Badge>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={markAllReadMutation.isPending}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition cursor-pointer disabled:opacity-50"
                  title="Barchasini o'qilgan qilish"
                >
                  {markAllReadMutation.isPending ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <CheckCheck className="size-3.5" />
                  )}
                  <span>O'qilgan qilish</span>
                </button>
              )}
            </div>

            {/* Filtr tablari */}
            <div className="flex border-b bg-muted/10 px-3 pt-2 gap-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={cn(
                  'pb-2 px-3 border-b-2 transition cursor-pointer',
                  activeTab === 'all'
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                Barchasi
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('unread')}
                className={cn(
                  'pb-2 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5',
                  activeTab === 'unread'
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <span>O'qilmagan</span>
                {unreadCount > 0 && (
                  <span className="size-1.5 rounded-full bg-primary" />
                )}
              </button>
            </div>

            {/* Xabarnomalar ro'yxati */}
            <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-border/40">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-xl" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-xl" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-4/5" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-xl" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
              ) : items.length === 0 ? (
                <div className="py-10 px-4 text-center">
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 text-muted-foreground">
                    <Inbox className="size-5" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    {activeTab === 'unread'
                      ? 'O‘qilmagan xabarnomalar yo‘q'
                      : 'Hozircha xabarnomalar yo‘q'}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Yangi xabarlar va yangilanishlar shu yerda aks etadi
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <NotificationItem
                    key={item.id}
                    notification={item}
                    mode="popover"
                    onClick={() => handleNotificationClick(item)}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-2 bg-muted/20 flex items-center justify-between text-xs font-semibold">
              <Link
                href="/profile/settings"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                <Settings className="size-3.5" />
                <span>Sozlamalar</span>
              </Link>

              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-primary hover:bg-primary/10 transition"
              >
                <span>Barcha xabarlar</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Tanlangan xabarnoma detali modali */}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={Boolean(selectedNotification)}
        onClose={() => setSelectedNotification(null)}
      />
    </>
  );
}
