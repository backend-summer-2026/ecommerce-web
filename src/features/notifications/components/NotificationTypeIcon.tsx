import React from 'react';
import {
  Package,
  CreditCard,
  UserCheck,
  Tag,
  AlertCircle,
  Bell,
  Sparkles,
} from 'lucide-react';
import type { NotificationType } from '@/types/notifications';
import { cn } from '@/lib/utils';

interface NotificationTypeIconProps {
  type: NotificationType;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function NotificationTypeIcon({
  type,
  className,
  size = 'md',
}: NotificationTypeIconProps) {
  const sizeClasses = {
    sm: 'size-7 text-xs',
    md: 'size-9 text-sm',
    lg: 'size-11 text-base',
  };

  const iconSizes = {
    sm: 'size-3.5',
    md: 'size-4',
    lg: 'size-5',
  };

  switch (type) {
    case 'ORDER':
      return (
        <div
          className={cn(
            'rounded-xl flex items-center justify-center shrink-0 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
            sizeClasses[size],
            className
          )}
          title="Buyurtma xabarnomasi"
        >
          <Package className={iconSizes[size]} />
        </div>
      );
    case 'PAYMENT':
      return (
        <div
          className={cn(
            'rounded-xl flex items-center justify-center shrink-0 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
            sizeClasses[size],
            className
          )}
          title="To'lov xabarnomasi"
        >
          <CreditCard className={iconSizes[size]} />
        </div>
      );
    case 'ACCOUNT':
      return (
        <div
          className={cn(
            'rounded-xl flex items-center justify-center shrink-0 bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400',
            sizeClasses[size],
            className
          )}
          title="Hisob xabarnomasi"
        >
          <UserCheck className={iconSizes[size]} />
        </div>
      );
    case 'PROMOTION':
      return (
        <div
          className={cn(
            'rounded-xl flex items-center justify-center shrink-0 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
            sizeClasses[size],
            className
          )}
          title="Aksiya va chegirmalar"
        >
          <Sparkles className={iconSizes[size]} />
        </div>
      );
    case 'SYSTEM':
    default:
      return (
        <div
          className={cn(
            'rounded-xl flex items-center justify-center shrink-0 bg-muted text-muted-foreground',
            sizeClasses[size],
            className
          )}
          title="Tizim xabarnomasi"
        >
          <AlertCircle className={iconSizes[size]} />
        </div>
      );
  }
}
