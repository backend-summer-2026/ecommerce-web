import type { NotificationPriority, NotificationType } from '@/types/notifications';

export function formatNotificationTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) {
      return 'Hozirgina';
    }
    if (diffMin < 60) {
      return `${diffMin} daqiqa oldin`;
    }
    if (diffHours < 24 && date.getDate() === now.getDate()) {
      const hh = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      return `Bugun, ${hh}:${mm}`;
    }
    if (diffDays === 1) {
      const hh = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      return `Kecha, ${hh}:${mm}`;
    }
    if (diffDays < 7) {
      return `${diffDays} kun oldin`;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hh}:${mm}`;
  } catch {
    return dateStr;
  }
}

export function getNotificationTypeLabel(type: NotificationType): string {
  switch (type) {
    case 'ORDER':
      return 'Buyurtma';
    case 'PAYMENT':
      return 'To‘lov';
    case 'ACCOUNT':
      return 'Hisob';
    case 'PROMOTION':
      return 'Aksiya';
    case 'SYSTEM':
      return 'Tizim';
    default:
      return type;
  }
}

export function getPriorityMeta(priority: NotificationPriority): {
  label: string;
  isUrgent: boolean;
  isHigh: boolean;
  className: string;
} {
  switch (priority) {
    case 'URGENT':
      return {
        label: 'Shoshilinch',
        isUrgent: true,
        isHigh: true,
        className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 font-semibold',
      };
    case 'HIGH':
      return {
        label: 'Muhim',
        isUrgent: false,
        isHigh: true,
        className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium',
      };
    case 'NORMAL':
      return {
        label: 'Oddiy',
        isUrgent: false,
        isHigh: false,
        className: 'bg-muted text-muted-foreground border-transparent',
      };
    case 'LOW':
      return {
        label: 'Past',
        isUrgent: false,
        isHigh: false,
        className: 'bg-muted/50 text-muted-foreground/80 border-transparent',
      };
    default:
      return {
        label: priority,
        isUrgent: false,
        isHigh: false,
        className: 'bg-muted text-muted-foreground',
      };
  }
}
