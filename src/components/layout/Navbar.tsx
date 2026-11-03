'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/features/auth/store/authStore';

export function Navbar() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo & Asosiy Menyu */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
            <ShoppingBag className="size-6" />
            <span>ApexShop</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/catalog" className="text-muted-foreground transition hover:text-foreground">
              Katalog
            </Link>
            <Link href="/categories" className="text-muted-foreground transition hover:text-foreground">
              Kategoriyalar
            </Link>
            <Link href="/featured" className="text-muted-foreground transition hover:text-foreground">
              Ommabop
            </Link>
          </nav>
        </div>

        {/* Qidiruv & Amallar */}
        <div className="flex items-center gap-3">
          {/* Qidiruv tugmasi / inputi */}
          <Link href="/catalog">
            <Button variant="ghost" size="icon" title="Qidiruv">
              <Search className="size-5" />
            </Button>
          </Link>

          {/* Bildirishnomalar */}
          {isAuthenticated && (
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative" title="Xabarnomalar">
                <Bell className="size-5" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center text-[10px]">
                  0
                </Badge>
              </Button>
            </Link>
          )}

          {/* Savatcha */}
          <Link href="/cart">
            <Button variant="outline" size="sm" className="relative flex items-center gap-2">
              <ShoppingBag className="size-4" />
              <span className="hidden sm:inline">Savatcha</span>
              <Badge variant="default" className="size-5 p-0 flex items-center justify-center text-[11px]">
                0
              </Badge>
            </Button>
          </Link>

          {/* Profil yoki Kirish */}
          {isAuthenticated ? (
            <Link href={user?.role === 'ADMIN' ? '/admin' : '/profile'}>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <User className="size-4" />
                <span className="hidden sm:inline">{user?.first_name || 'Profil'}</span>
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm">Kirish</Button>
            </Link>
          )}

          {/* Mobil Menyu */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
