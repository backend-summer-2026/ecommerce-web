'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  ShieldCheck,
  Search,
  X,
  ExternalLink,
  Store,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CommandItem {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
}

const commands: CommandItem[] = [
  {
    href: '/admin',
    label: 'Tahlillar & KPI (Dashboard)',
    description: "Umumiy tushum, KPI lar va oylik dinamika grafigi",
    icon: BarChart3,
  },
  {
    href: '/admin/products',
    label: 'Mahsulotlar Katalogi',
    description: "Katalogdagi barcha tovarlar, narxlar va qoldiqlar",
    icon: Package,
  },
  {
    href: '/admin/inventory',
    label: 'Ombor & Zaxiralar',
    description: "Kam qolgan tovarlar nazorati va qoldiqni tuzatish",
    icon: Boxes,
  },
  {
    href: '/admin/orders',
    label: 'Buyurtmalar Boshqaruvi',
    description: "Kelgan buyurtmalar, kuryer kuzatuv kodi va statuslar",
    icon: ShoppingBag,
  },
  {
    href: '/admin/customers',
    label: 'Mijozlar CRM',
    description: "Xaridorlar bazasi, xaridlar summasi (LTV) va bloklash",
    icon: Users,
  },
  {
    href: '/admin/payments',
    label: "To'lovlar & Qaytarish (Refunds)",
    description: "Payme, Click to'lovlari auditi va pulni qaytarish",
    icon: CreditCard,
  },
  {
    href: '/admin/reviews',
    label: 'Sharhlar Moderatsiyasi',
    description: "Xaridorlar sharhlarini tasdiqlash va rasmiy javob berish",
    icon: MessageSquare,
  },
  {
    href: '/admin/notifications',
    label: 'Xabarnomalar & Email Navbati',
    description: "Broadcast xabarlar, shablonlar va yuborilmagan email auditi",
    icon: Bell,
  },
  {
    href: '/admin/alerts',
    label: 'Tizim Ogohlantirishlari',
    description: "Kritik tizim xatoliklari va operatsion ogohlantirishlar",
    icon: AlertTriangle,
  },
  {
    href: '/admin/audit-logs',
    label: 'Xodimlar Harakati Auditi',
    description: "Administratorlar bajargan barcha amallar jurnali",
    icon: ShieldCheck,
  },
];

interface AdminCommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminCommandMenu({ isOpen, onClose }: AdminCommandMenuProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          router.push(selected.href);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, router, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-card border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b bg-muted/20">
          <Search className="size-5 text-muted-foreground shrink-0 mr-3" />
          <Input
            autoFocus
            placeholder="Bo'limlar yoki buyruqlar bo'yicha qidiring... (Masalan: Buyurtmalar, Ombor)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 border-0 shadow-none focus-visible:ring-0 text-sm bg-transparent px-0"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted ml-2"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Mavjud buyruq yoki bo'lim topilmadi
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.href}
                  type="button"
                  onClick={() => {
                    router.push(cmd.href);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{cmd.label}</p>
                      <p
                        className={`text-xs truncate ${
                          isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}
                      >
                        {cmd.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 border-t bg-muted/40 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>Tanlash: <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">↵</kbd></span>
            <span>Navigatsiya: <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">↓</kbd></span>
            <span>Yopish: <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono">Esc</kbd></span>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            <Store className="size-3" />
            <span>Do'kon</span>
          </a>
        </div>
      </div>
    </div>
  );
}
