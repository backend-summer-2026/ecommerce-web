'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Bell,
  User as UserIcon,
  CreditCard,
  Receipt,
  Package,
  ChevronLeft,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/store/authStore';
import { NotificationPreferencesForm } from '@/features/notifications/components/NotificationPreferencesForm';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/profile/settings');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl space-y-8">
      {/* Breadcrumbs & Header */}
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
          <span className="text-foreground font-medium">Sozlamalar</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Settings className="size-5" />
              </div>
              <span>Hisob va Xabarnoma Sozlamalari</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Qaysi xabarlar va qanday kanallar (In-App, Email) orqali yuborilishini boshqaring
            </p>
          </div>

          <Link href="/profile">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs rounded-xl self-start">
              <ChevronLeft className="size-3.5" />
              <span>Profilga qaytish</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Yon menyu (Sidebar Navigation) */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-2 space-y-1">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition"
                >
                  <LayoutDashboard className="size-4" />
                  <span>Admin Panel</span>
                </Link>
              )}

              <Link
                href="/profile"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition text-foreground"
              >
                <UserIcon className="size-4 text-muted-foreground" />
                <span>Shaxsiy ma'lumotlar</span>
              </Link>

              <Link
                href="/orders"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition"
              >
                <Package className="size-4 text-muted-foreground" />
                <span>Mening buyurtmalarim</span>
              </Link>

              <Link
                href="/profile/cards"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition"
              >
                <CreditCard className="size-4 text-muted-foreground" />
                <span>Bank kartalari</span>
              </Link>

              <Link
                href="/profile/payments"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition"
              >
                <Receipt className="size-4 text-muted-foreground" />
                <span>To‘lovlar tarixi</span>
              </Link>

              <Link
                href="/notifications"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition"
              >
                <Bell className="size-4 text-muted-foreground" />
                <span>Xabarnomalar</span>
              </Link>

              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold bg-primary/10 text-primary">
                <Settings className="size-4" />
                <span>Sozlamalar</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sozlamalar formasi (Notification Preferences) */}
        <div className="md:col-span-2">
          <NotificationPreferencesForm />
        </div>
      </div>
    </div>
  );
}
