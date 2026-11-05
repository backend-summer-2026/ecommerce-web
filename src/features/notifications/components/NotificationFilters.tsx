'use client';

import React from 'react';
import {
  Search,
  CheckCheck,
  Trash2,
  Filter,
  Package,
  CreditCard,
  Sparkles,
  AlertCircle,
  Inbox,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { NotificationType } from '@/types/notifications';
import { cn } from '@/lib/utils';

export type NotificationTabKey = 'ALL' | 'UNREAD' | NotificationType;

interface NotificationFiltersProps {
  activeTab: NotificationTabKey;
  onTabChange: (tab: NotificationTabKey) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  unreadCount: number;
  totalCount?: number;
  onMarkAllRead: () => void;
  isMarkingAllRead?: boolean;
  onClearRead: () => void;
  isClearingRead?: boolean;
}

export function NotificationFilters({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  unreadCount,
  totalCount,
  onMarkAllRead,
  isMarkingAllRead,
  onClearRead,
  isClearingRead,
}: NotificationFiltersProps) {
  const tabs: { key: NotificationTabKey; label: string; icon?: React.ReactNode }[] = [
    { key: 'ALL', label: 'Barchasi' },
    { key: 'UNREAD', label: 'O‘qilmagan' },
    { key: 'ORDER', label: 'Buyurtmalar', icon: <Package className="size-3.5" /> },
    { key: 'PAYMENT', label: 'To‘lovlar', icon: <CreditCard className="size-3.5" /> },
    { key: 'PROMOTION', label: 'Aksiyalar', icon: <Sparkles className="size-3.5" /> },
    { key: 'SYSTEM', label: 'Tizim', icon: <AlertCircle className="size-3.5" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Yuqori qidiruv va umumiy amallar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Xabarnomalarni sarlavha yoki matn bo'yicha qidirish..."
            className="pl-9 text-xs sm:text-sm h-10 rounded-xl"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              Tozalash
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllRead}
              disabled={isMarkingAllRead}
              className="text-xs h-9 rounded-xl gap-1.5"
            >
              {isMarkingAllRead ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCheck className="size-3.5 text-primary" />
              )}
              <span>Barchasini o'qilgan qilish</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearRead}
            disabled={isClearingRead}
            className="text-xs h-9 rounded-xl gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="O'qilgan xabarnomalarni ro'yxatdan o'chirish"
          >
            {isClearingRead ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            <span>O'qilganlarni tozalash</span>
          </Button>
        </div>
      </div>

      {/* Toifalar bo'yicha navigatsiya tablari */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted border-border/70'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.key === 'UNREAD' && unreadCount > 0 && (
                <Badge
                  variant={isActive ? 'secondary' : 'default'}
                  className={cn(
                    'text-[10px] h-4.5 px-1.5 rounded-full',
                    isActive ? 'bg-primary-foreground text-primary' : ''
                  )}
                >
                  {unreadCount}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
