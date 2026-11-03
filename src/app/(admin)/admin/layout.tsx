'use client';

import React from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/admin', label: 'Tahlillar & KPI', icon: BarChart3 },
  { href: '/admin/inventory', label: 'Ombor & Zaxiralar', icon: Package },
  { href: '/admin/orders', label: 'Buyurtmalar', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Mijozlar CRM', icon: Users },
  { href: '/admin/payments', label: 'To\'lovlar & Qaytarish', icon: CreditCard },
  { href: '/admin/reviews', label: 'Sharhlar Moderatsiyasi', icon: MessageSquare },
  { href: '/admin/notifications', label: 'Xabarnomalar & Email', icon: Bell },
  { href: '/admin/alerts', label: 'Tizim Ogohlantirishlari', icon: AlertTriangle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6 font-bold text-lg text-primary">
          <ShoppingBag className="size-6" />
          <span>Apex Backoffice</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <ArrowLeft className="size-4" />
              <span>Do'konga qaytish</span>
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <h1 className="font-semibold text-lg">Boshqaruv Paneli</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Admin Mode</span>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
