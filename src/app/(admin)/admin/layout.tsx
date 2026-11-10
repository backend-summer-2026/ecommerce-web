'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Package,
  Boxes,
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
  Search,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useSystemAlerts } from '@/features/dashboard/hooks/useDashboard';
import { AdminCommandMenu } from '@/components/admin/AdminCommandMenu';
import { LiveOrderNotifier } from '@/components/admin/LiveOrderNotifier';

const navItems = [
  { href: '/admin', label: 'Tahlillar & KPI', icon: BarChart3 },
  { href: '/admin/products', label: 'Mahsulotlar', icon: Package },
  { href: '/admin/inventory', label: 'Ombor & Zaxiralar', icon: Boxes },
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
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const { data: alertsData } = useSystemAlerts({ is_resolved: false });
  const unresolvedAlertsCount = alertsData?.count ?? 0;

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Admin paneldan muvaffaqiyatli chiqildi');
    router.push('/login');
  };

  // Active page label
  const currentNav = navItems.find((item) =>
    item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
  );

  // If not logged in and not loading, show clean Auth Guard screen
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md bg-card border rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
          <div className="size-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <Lock className="size-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Avtorizatsiya talab etiladi</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Admin panelga kirish uchun xodim yoki administrator hisobingiz orqali tizimga kirishingiz lozim.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={() => router.push(`/login?redirect=${encodeURIComponent(pathname)}`)}
              className="gap-2 font-semibold"
            >
              <LogOut className="size-4 rotate-180" />
              <span>Tizimga Kirish</span>
            </Button>
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">
                Bosh sahifa
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <Link href="/admin" className="flex items-center gap-2.5 font-bold text-lg text-primary">
            <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black shadow-xs">
              A
            </div>
            <div className="flex flex-col">
              <span className="leading-tight text-foreground font-black tracking-tight">Apex Admin</span>
              <span className="text-[10px] text-muted-foreground font-normal">Backoffice Panel</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tezkor qidiruv tugmasi (Sidebar) */}
        <div className="px-4 pt-3 pb-1">
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-muted-foreground bg-muted/40 hover:bg-muted border rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="size-3.5" />
              <span>Tezkor qidiruv...</span>
            </div>
            <kbd className="text-[10px] bg-background border px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
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
                    ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
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

        {/* Sidebar Footer */}
        <div className="border-t p-4 space-y-2 bg-muted/10">
          <div className="flex items-center justify-between gap-2 px-1 py-1">
            <div className="flex items-center gap-2.5 truncate">
              <div className="size-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                <UserIcon className="size-4" />
              </div>
              <div className="truncate min-w-0">
                <p className="font-semibold text-xs text-foreground truncate">
                  {user?.first_name || user?.email || 'Administrator'}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize">
                  {user?.role || (user?.is_staff ? 'Staff' : 'Admin')}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
              title="Tizimdan chiqish"
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link href="/" target="_blank">
              <Button variant="outline" size="sm" className="w-full justify-center gap-1.5 text-xs h-8">
                <Store className="size-3" />
                <span>Do'kon</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-center gap-1.5 text-xs h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-3" />
              <span>Chiqish</span>
            </Button>
          </div>
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
              <Link href="/admin" className="text-muted-foreground hover:text-foreground font-medium">
                Boshqaruv
              </Link>
              {currentNav && currentNav.href !== '/admin' && (
                <>
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                  <span className="font-bold text-foreground">{currentNav.label}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Real-time jonli operatsion markaz & audio toggle */}
            <LiveOrderNotifier />

            {/* Tezkor qidiruv tugmasi (Header) */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCommandOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 text-xs text-muted-foreground h-9 px-3 cursor-pointer"
            >
              <Search className="size-3.5" />
              <span>Qidiruv</span>
              <kbd className="text-[10px] bg-muted border px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </Button>

            {unresolvedAlertsCount > 0 && (
              <Link href="/admin/alerts">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-amber-600 border-amber-300 bg-amber-500/10 hover:bg-amber-500/20 h-9"
                >
                  <AlertTriangle className="size-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Ogohlantirishlar:</span>
                  <span className="font-bold">{unresolvedAlertsCount}</span>
                </Button>
              </Link>
            )}

            <Link href="/" target="_blank">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-9">
                <ArrowLeft className="size-3.5" />
                <span className="hidden sm:inline">Storefront</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="size-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hidden sm:inline-flex"
              title="Chiqish"
            >
              <LogOut className="size-4" />
            </Button>
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

      {/* Global Quick Command Menu (⌘K) */}
      <AdminCommandMenu
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </div>
  );
}
