'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  MessageSquare,
  Bell,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Menu,
  X,
  Store,
  ChevronRight,
  LogOut,
  User as UserIcon,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useSystemAlerts } from '@/features/dashboard/hooks/useDashboard';

const navItems = [
  { href: '/admin', label: 'Tahlillar & KPI', icon: BarChart3 },
  { href: '/admin/inventory', label: 'Ombor & Zaxiralar', icon: Package },
  { href: '/admin/orders', label: 'Buyurtmalar', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Mijozlar CRM', icon: Users },
  { href: '/admin/payments', label: "To'lovlar & Qaytarish", icon: CreditCard },
  { href: '/admin/reviews', label: 'Sharhlar Moderatsiyasi', icon: MessageSquare },
  { href: '/admin/notifications', label: 'Xabarnomalar & Email', icon: Bell },
  { href: '/admin/alerts', label: 'Tizim Ogohlantirishlari', icon: AlertTriangle, hasAlertBadge: true },
  { href: '/admin/audit-logs', label: 'Xodimlar Auditi', icon: ShieldCheck },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { data: alertsData } = useSystemAlerts({ is_resolved: false });
  const unresolvedAlertsCount = alertsData?.count ?? 0;

  // Active page label
  const currentNav = navItems.find((item) =>
    item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
  );

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-200 lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-lg text-primary">
            <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black">
              A
            </div>
            <span>Apex Backoffice</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.hasAlertBadge && unresolvedAlertsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className={cn(
                      'size-5 p-0 flex items-center justify-center text-[10px] font-bold rounded-full',
                      isActive && 'bg-primary-foreground text-primary'
                    )}
                  >
                    {unresolvedAlertsCount > 9 ? '9+' : unresolvedAlertsCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4 space-y-2">
          {/* User profile brief */}
          <div className="flex items-center gap-3 px-2 py-1 text-xs text-muted-foreground">
            <div className="size-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
              <UserIcon className="size-3.5" />
            </div>
            <div className="truncate flex-1">
              <p className="font-semibold text-foreground truncate">
                {user?.first_name || user?.email || 'Administrator'}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize">
                {user?.role || 'Staff Operator'}
              </p>
            </div>
          </div>

          <Link href="/" target="_blank">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
              <Store className="size-3.5" />
              <span>Do'konni ochish</span>
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden"
            >
              <Menu className="size-5" />
            </Button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
              <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                Boshqaruv
              </Link>
              {currentNav && currentNav.href !== '/admin' && (
                <>
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{currentNav.label}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unresolvedAlertsCount > 0 && (
              <Link href="/admin/alerts">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-amber-600 border-amber-300 bg-amber-500/10 hover:bg-amber-500/20"
                >
                  <AlertTriangle className="size-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Faol ogohlantirishlar:</span>
                  <span className="font-bold">{unresolvedAlertsCount}</span>
                </Button>
              </Link>
            )}

            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft className="size-3.5" />
                <span className="hidden sm:inline">Storefront</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Warning banner if not staff or not authenticated */}
        {isAuthenticated && user && !user.is_staff && user.role !== 'admin' && (
          <div className="bg-amber-500/10 border-b border-amber-300 p-3 px-6 text-xs text-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 shrink-0 text-amber-600" />
              <span>
                <strong>Diqqat:</strong> Sizning hisobingiz to'liq administrator huquqlariga ega emas. Ayrim amallar backend tomonidan rad etilishi mumkin.
              </span>
            </div>
            <Link href="/login" className="underline font-semibold ml-2">
              Admin sifatida kirish
            </Link>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
