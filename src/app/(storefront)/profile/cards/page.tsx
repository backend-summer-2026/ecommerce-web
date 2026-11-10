'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Plus,
  ShieldCheck,
  ChevronRight,
  Lock,
  Zap,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store/authStore';
import {
  useSavedCards,
  useSetDefaultCard,
  useDeleteSavedCard,
} from '@/features/payments/hooks/usePayments';
import { parsePaymentError } from '@/features/payments/api/paymentsApi';
import { CreditCardDisplay } from '@/features/payments/components/CreditCardDisplay';
import { AddCardModal } from '@/features/payments/components/AddCardModal';
import type { SavedCard } from '@/types/payments';

export default function SavedCardsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [cardToVerify, setCardToVerify] = useState<SavedCard | null>(null);

  // Auth himoyasi
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login?redirect=/profile/cards');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const { data: cards = [], isLoading: isCardsLoading } = useSavedCards(isAuthenticated);
  const setDefaultMutation = useSetDefaultCard();
  const deleteCardMutation = useDeleteSavedCard();

  const handleSetDefault = async (cardId: number) => {
    try {
      await setDefaultMutation.mutateAsync(cardId);
      toast.success('Asosiy to‘lov kartasi o‘zgartirildi');
    } catch (err) {
      toast.error(parsePaymentError(err));
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!window.confirm('Haqiqatan ham ushbu bank kartasini o‘chirmoqchimisiz?')) {
      return;
    }

    try {
      await deleteCardMutation.mutateAsync(cardId);
      toast.success('Bank kartasi muvaffaqiyatli o‘chirildi');
    } catch (err) {
      toast.error(parsePaymentError(err));
    }
  };

  if (isAuthLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      </div>
    );
  }

  const verifiedCards = cards.filter((c) => c.is_verified);
  const pendingCards = cards.filter((c) => !c.is_verified);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl space-y-8">
      {/* Breadcrumb navigatsiya */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors">
          Bosh sahifa
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/profile" className="hover:text-foreground transition-colors">
          Shaxsiy kabinet
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">Bank kartalari</span>
      </nav>

      {/* Sarlavha qatori va Yangi karta tugmasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Bank kartalari
            </h1>
            <Badge variant="secondary" className="font-bold text-xs">
              {cards.length} ta karta
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Saqlangan bank kartalaringizni boshqaring va 1-bosishda xavfsiz to‘lov qiling.
          </p>
        </div>

        <Button
          onClick={() => {
            setCardToVerify(null);
            setIsAddCardOpen(true);
          }}
          className="gap-2 font-bold cursor-pointer shrink-0"
        >
          <Plus className="size-4" />
          <span>Yangi karta qo‘shish</span>
        </Button>
      </div>

      {/* Xavfsizlik va Imkoniyatlar eslatmasi */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border bg-card/60 flex items-center gap-3 text-xs">
          <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="size-4.5" />
          </div>
          <div>
            <div className="font-bold">100% Xavfsiz</div>
            <div className="text-[11px] text-muted-foreground">PCI DSS xalqaro standarti</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border bg-card/60 flex items-center gap-3 text-xs">
          <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Zap className="size-4.5" />
          </div>
          <div>
            <div className="font-bold">1-Click To‘lov</div>
            <div className="text-[11px] text-muted-foreground">SMS kodsiz tezkor xarid</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border bg-card/60 flex items-center gap-3 text-xs">
          <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Lock className="size-4.5" />
          </div>
          <div>
            <div className="font-bold">Maxfiylik kafolati</div>
            <div className="text-[11px] text-muted-foreground">Karta raqami shifrlangan</div>
          </div>
        </div>
      </div>

      {/* Kartalar ro'yxati */}
      {isCardsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
        </div>
      ) : cards.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed bg-card/50 space-y-4">
          <div className="size-16 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
            <CreditCard className="size-8" />
          </div>
          <div className="max-w-sm mx-auto space-y-1">
            <h3 className="text-base font-bold text-foreground">
              Hozircha saqlangan kartalaringiz yo‘q
            </h3>
            <p className="text-xs text-muted-foreground">
              Uzcard, Humo, Visa yoki Mastercard kartangizni qo‘shing va xaridlarni 1-bosishda amalga oshiring.
            </p>
          </div>
          <Button
            onClick={() => {
              setCardToVerify(null);
              setIsAddCardOpen(true);
            }}
            className="gap-2 font-bold cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Karta qo‘shish</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tasdiqlanmagan kartalar bo'lsa ogohlantirish */}
          {pendingCards.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                <Info className="size-4" />
                <span>Tasdiqlash kutilayotgan kartalar ({pendingCards.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pendingCards.map((card) => (
                  <CreditCardDisplay
                    key={card.id}
                    card={card}
                    onVerify={(c) => {
                      setCardToVerify(c);
                      setIsAddCardOpen(true);
                    }}
                    onDelete={handleDeleteCard}
                    isDeleting={deleteCardMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Faol va tasdiqlangan kartalar */}
          {verifiedCards.length > 0 && (
            <div className="space-y-3">
              {pendingCards.length > 0 && (
                <div className="text-xs font-bold text-muted-foreground uppercase">
                  Faol kartalar ({verifiedCards.length})
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {verifiedCards.map((card) => (
                  <CreditCardDisplay
                    key={card.id}
                    card={card}
                    onSetDefault={handleSetDefault}
                    onDelete={handleDeleteCard}
                    isSettingDefault={setDefaultMutation.isPending}
                    isDeleting={deleteCardMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Karta qo'shish va OTP tasdiqlash modali */}
      <AddCardModal
        isOpen={isAddCardOpen}
        onClose={() => {
          setIsAddCardOpen(false);
          setCardToVerify(null);
        }}
        initialCardForVerification={cardToVerify}
      />
    </div>
  );
}
