'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  Bell,
  Menu,
  X,
  LayoutDashboard,
  Package,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '@/features/cart/store/cartStore';
import { SearchBar } from '@/features/catalog/components/SearchBar';
import { CategoryMegaMenu } from '@/features/catalog/components/CategoryMegaMenu';
import { toast } from 'sonner';

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const { itemCount, openDrawer } = useCartStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  // Tashqariga bosilganda dropdownni yopish
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    toast.success('Hisobingizdan muvaffaqiyatli chiqdingiz');
    router.push('/login');
  };

  const userDisplayName = user?.first_name || user?.email?.split('@')[0] || 'Foydalanuvchi';
  const initials =
    (user?.first_name?.[0] || '') + (user?.last_name?.[0] || '') ||
    (user?.email?.[0] || 'U').toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        {/* Logo & Mega Menyu */}
        <div className="flex items-center gap-4 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 font-black text-xl tracking-tight text-primary transition-opacity hover:opacity-90"
          >
            <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
              <ShoppingBag className="size-5" />
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              ApexShop
            </span>
          </Link>

          {/* Desktop Mega Menyu */}
          <div className="hidden lg:block">
            <CategoryMegaMenu />
          </div>
        </div>

        {/* Qidiruv Paneli (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-2">
          <SearchBar />
        </div>

        {/* O'ng tarafdagi harakatlar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobil Qidiruv tugmasi */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            title="Qidiruv"
          >
            <Search className="size-5" />
          </Button>

          {/* Desktop qo'shimcha havolalar */}
          <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-muted-foreground mr-2">
            <Link href="/catalog" className="hover:text-foreground transition-colors">
              Katalog
            </Link>
            <Link href="/brands" className="hover:text-foreground transition-colors">
              Brendlar
            </Link>
          </nav>

          {/* Bildirishnomalar (Faqat kirgan foydalanuvchiga) */}
          {isAuthenticated && (
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative" title="Xabarnomalar">
                <Bell className="size-5" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center text-[10px]"
                >
                  0
                </Badge>
              </Button>
            </Link>
          )}

          {/* Savatcha (Slide-over drawer ochadi) */}
          <Button
            variant="outline"
            size="sm"
            onClick={openDrawer}
            className="relative flex items-center gap-2 rounded-full px-3 cursor-pointer hover:bg-muted transition"
            title="Savatcha"
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline font-medium">Savatcha</span>
            {itemCount > 0 ? (
              <Badge
                variant="default"
                className="size-5 p-0 flex items-center justify-center text-[11px] rounded-full"
              >
                {itemCount > 99 ? '99+' : itemCount}
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="size-5 p-0 flex items-center justify-center text-[11px] rounded-full text-muted-foreground"
              >
                0
              </Badge>
            )}
          </Button>

          {/* Profil yoki Kirish */}
          {isLoading ? (
            <Skeleton className="h-9 w-20 rounded-full" />
          ) : isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-border p-1 pr-2.5 text-sm font-medium hover:bg-muted transition cursor-pointer"
                aria-expanded={dropdownOpen}
              >
                <div className="size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {initials}
                </div>
                <span className="hidden sm:inline text-xs font-semibold max-w-[120px] truncate">
                  {userDisplayName}
                </span>
                <ChevronDown className="size-3 text-muted-foreground" />
              </button>

              {/* User Dropdown Menyu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-lg ring-1 ring-black/5 z-50">
                  <div className="px-3 py-2 border-b mb-1">
                    <p className="text-sm font-semibold truncate">
                      {user.first_name ? `${user.first_name} ${user.last_name || ''}` : userDisplayName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <div className="mt-1">
                      <Badge variant={isAdmin ? 'default' : 'secondary'} className="text-[10px] uppercase">
                        {isAdmin ? 'Admin' : 'Mijoz'}
                      </Badge>
                    </div>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition"
                    >
                      <LayoutDashboard className="size-4" />
                      <span>Admin Boshqaruv Paneli</span>
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-muted transition"
                  >
                    <UserIcon className="size-4 text-muted-foreground" />
                    <span>Mening profilim</span>
                  </Link>

                  <Link
                    href="/orders"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-muted transition"
                  >
                    <Package className="size-4 text-muted-foreground" />
                    <span>Buyurtmalarim</span>
                  </Link>

                  <div className="border-t my-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition cursor-pointer"
                  >
                    <LogOut className="size-4" />
                    <span>Tizimdan chiqish</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="sm">Kirish</Button>
              </Link>
              <Link href="/register" className="hidden sm:inline-block">
                <Button variant="outline" size="sm">
                  Ro'yxatdan o'tish
                </Button>
              </Link>
            </div>
          )}

          {/* Mobil Menyu Ochish */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Menyu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobil Qidiruv Qatori */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t px-4 py-2.5 bg-background">
          <SearchBar
            onSearchSubmit={() => setMobileSearchOpen(false)}
            autoFocus
          />
        </div>
      )}

      {/* Mobil Navigatsiya Menyu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background px-4 py-3 space-y-2">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              openDrawer();
            }}
            className="w-full text-left flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-muted cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="size-4" />
              <span>Savatcha</span>
            </span>
            {itemCount > 0 && (
              <Badge variant="default" className="text-xs px-2 py-0">
                {itemCount}
              </Badge>
            )}
          </button>
          <Link
            href="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
          >
            Mahsulotlar Katalogi
          </Link>
          <Link
            href="/categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
          >
            Barcha Kategoriyalar
          </Link>
          <Link
            href="/brands"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
          >
            Brendlar
          </Link>
          <Link
            href="/catalog?ordering=-created_at"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
          >
            Yangi kelganlar
          </Link>
          {!isAuthenticated && (
            <div className="pt-2 border-t flex gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                <Button size="sm" className="w-full">
                  Kirish
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Ro'yxatdan o'tish
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
