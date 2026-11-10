'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  Trash2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Inbox,
  AlertTriangle,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/store/authStore';
import {
  useNotifications,
  useNotificationUnreadCount,
  useMarkAllNotificationsRead,
  useClearReadNotifications,
} from '@/features/notifications/hooks/useNotifications';
import {
  NotificationItem,
  NotificationDetailModal,
  NotificationFilters,
  type NotificationTabKey,
} from '@/features/notifications/components';
import type {
  NotificationItem as NotificationItemType,
  NotificationType,
} from '@/types/notifications';

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  const [activeTab, setActiveTab] = useState<NotificationTabKey>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItemType | null>(null);

  // Qidiruv uchun debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auth tekshiruvi
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login?redirect=/notifications');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const { data: counters } = useNotificationUnreadCount();
  const unreadCount = counters?.unread_count ?? 0;
  const urgentCount = counters?.urgent_count ?? 0;

  // Filtr parametrlarini shakllantirish
  const filterParams = {
    page: currentPage,
    page_size: 15,
    q: debouncedSearch || undefined,
    is_read: activeTab === 'UNREAD' ? false : undefined,
    type:
      activeTab !== 'ALL' && activeTab !== 'UNREAD'
        ? (activeTab as NotificationType)
        : undefined,
  };

  const { data: notificationsData, isLoading, isFetching } = useNotifications(filterParams);

  const markAllReadMutation = useMarkAllNotificationsRead();
  const clearReadMutation = useClearReadNotifications();

  const handleTabChange = (tab: NotificationTabKey) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      markAllReadMutation.mutate();
    }
  };

  const handleClearRead = () => {
    if (
      window.confirm(
        'Barcha o‘qilgan xabarnomalarni butunlay o‘chirmoqchimisiz? Ushbu amalni qaytarib bo‘lmaydi.'
      )
    ) {
      clearReadMutation.mutate();
    }
  };

  if (isAuthLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const items = notificationsData?.results || [];
  const totalCount = notificationsData?.count || 0;
  const totalPages = notificationsData?.total_pages || 1;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl space-y-8">
      {/* Sahifa bosh sarlavhasi va statistika */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/" className="hover:text-foreground transition">
              Bosh sahifa
            </Link>
            <span>/</span>
            <Link href="/profile" className="hover:text-foreground transition">
              Profil
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Xabarnomalar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="size-5" />
            </div>
            <span>Xabarnomalar Markazi</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Buyurtma holati o'zgarishlari, to'lov xabarlari va maxsus takliflar
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center">
          <Link href="/profile/settings">
            <Button variant="outline" size="sm" className="gap-2 text-xs rounded-xl">
              <Settings className="size-4" />
              <span>Xabarnoma sozlamalari</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistika ko'rsatkichlari kartochkalari */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-card shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Layers className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Jami xabarnomalar</p>
              <p className="text-xl font-bold text-foreground">{totalCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Bell className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">O‘qilmagan</p>
              <p className="text-xl font-bold text-foreground">{unreadCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-xs col-span-2 sm:col-span-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Shoshilinch / Muhim</p>
              <p className="text-xl font-bold text-foreground">{urgentCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtrlar va amallar */}
      <NotificationFilters
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        unreadCount={unreadCount}
        totalCount={totalCount}
        onMarkAllRead={handleMarkAllRead}
        isMarkingAllRead={markAllReadMutation.isPending}
        onClearRead={handleClearRead}
        isClearingRead={clearReadMutation.isPending}
      />

      {/* Xabarnomalar ro'yxati */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-2xl border bg-card"
              >
                <Skeleton className="size-10 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border bg-muted/20 p-8 space-y-3">
            <div className="size-14 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Inbox className="size-7" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {searchQuery
                ? 'Qidiruv bo‘yicha hech narsa topilmadi'
                : activeTab === 'UNREAD'
                ? 'Barcha xabarnomalar o‘qilgan!'
                : 'Hech qanday xabarnoma mavjud emas'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? 'Boshqa kalit so‘z bilan qidirib ko‘ring yoki filtrlarni tozalang.'
                : 'Yangi buyurtmalar va to‘lovlar amalga oshirilganda bu yerda xabarlar paydo bo‘ladi.'}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="text-xs mt-2"
              >
                Qidiruvni tozalash
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => (
              <NotificationItem
                key={item.id}
                notification={item}
                mode="full"
                onClick={() => setSelectedNotification(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sahifalash (Pagination) */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t text-xs text-muted-foreground">
          <span>
            Jami {totalCount} ta xabardan {(currentPage - 1) * 15 + 1} -{' '}
            {Math.min(currentPage * 15, totalCount)} ko'rsatilmoqda
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isFetching}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="text-xs h-8 gap-1 rounded-lg"
            >
              <ChevronLeft className="size-3.5" />
              <span>Oldingi</span>
            </Button>

            <span className="px-2 font-medium">
              {currentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isFetching}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="text-xs h-8 gap-1 rounded-lg"
            >
              <span>Keyingi</span>
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Tafsilot modali */}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={Boolean(selectedNotification)}
        onClose={() => setSelectedNotification(null)}
      />
    </div>
  );
}
