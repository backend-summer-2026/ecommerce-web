'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Loader2,
  ExternalLink,
  Plus,
  ShieldCheck,
  Zap,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import {
  useSavedCards,
  useInitializePayment,
  usePayWithCard,
} from '@/features/payments/hooks/usePayments';
import { parsePaymentError } from '@/features/payments/api/paymentsApi';
import { CreditCardDisplay } from '@/features/payments/components/CreditCardDisplay';
import { AddCardModal } from '@/features/payments/components/AddCardModal';
import type { PaymentProvider } from '@/types/payments';
import { toast } from 'sonner';

interface PaymentModalProps {
  orderNumber: string;
  totalAmount: string | number;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

type TabType = 'SAVED_CARD' | 'PAYME' | 'CLICK';

export function PaymentModal({
  orderNumber,
  totalAmount,
  isOpen,
  onClose,
  onPaymentSuccess,
}: PaymentModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('SAVED_CARD');
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  const { data: cards = [], isLoading: isCardsLoading } = useSavedCards(isOpen);
  const initializePaymentMutation = useInitializePayment();
  const payWithCardMutation = usePayWithCard();

  const verifiedCards = cards.filter((c) => c.is_verified);
  const defaultCard = verifiedCards.find((c) => c.is_default) || verifiedCards[0];
  const activeSelectedCardId = selectedCardId ?? defaultCard?.id ?? null;

  if (!isOpen) return null;

  // 1-Click to'lov (Saqlangan karta bilan)
  const handlePayWithCard = async () => {
    if (!activeSelectedCardId) {
      toast.error('Iltimos, to‘lov uchun bank kartasini tanlang');
      return;
    }

    try {
      const res = await payWithCardMutation.mutateAsync({
        order_number: orderNumber,
        card_id: activeSelectedCardId,
      });

      toast.success(
        res.message || 'To‘lov muvaffaqiyatli amalga oshirildi!'
      );
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      onClose();
      router.push(`/orders/${orderNumber}?paid=true`);
    } catch (err) {
      toast.error(parsePaymentError(err));
    }
  };

  // Payme yoki Click orqali to'lov (tashqi sahifaga yo'naltirish)
  const handleInitializeGateway = async (provider: PaymentProvider) => {
    try {
      const returnUrl = `${window.location.origin}/payments/verify?order_number=${orderNumber}`;
      const res = await initializePaymentMutation.mutateAsync({
        order_number: orderNumber,
        provider,
        return_url: returnUrl,
      });

      if (res.payment_url) {
        toast.info(`${provider} to‘lov sahifasiga yo‘naltirilmoqda...`);
        window.location.href = res.payment_url;
      } else {
        toast.success('To‘lov muvaffaqiyatli qabul qilindi');
        onClose();
        if (onPaymentSuccess) onPaymentSuccess();
      }
    } catch (err) {
      toast.error(parsePaymentError(err));
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal oynasi */}
        <div className="relative w-full max-w-xl rounded-3xl border bg-background p-6 shadow-2xl animate-in zoom-in-95 duration-200">
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Buyurtmani to‘lash</h2>
                <p className="text-xs text-muted-foreground">
                  Buyurtma <span className="font-mono font-bold text-foreground">#{orderNumber}</span>
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full size-8"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Summa kartochkasi */}
          <div className="my-5 p-4 rounded-2xl bg-muted/50 border flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              To‘lanadigan jami summa:
            </div>
            <div className="text-xl font-black text-primary">
              {formatPrice(totalAmount)}
            </div>
          </div>

          {/* Tablar (Saqlangan karta / Payme / Click) */}
          <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-muted/60 mb-5">
            <button
              type="button"
              onClick={() => setActiveTab('SAVED_CARD')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'SAVED_CARD'
                  ? 'bg-background text-foreground shadow-xs ring-1 ring-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Zap className="size-3.5 text-amber-500" />
              <span>1-Click Karta</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PAYME')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'PAYME'
                  ? 'bg-background text-cyan-600 shadow-xs ring-1 ring-cyan-200 dark:ring-cyan-800'
                  : 'text-muted-foreground hover:text-cyan-600'
              }`}
            >
              <span>Payme</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('CLICK')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'CLICK'
                  ? 'bg-background text-blue-600 shadow-xs ring-1 ring-blue-200 dark:ring-blue-800'
                  : 'text-muted-foreground hover:text-blue-600'
              }`}
            >
              <span>Click</span>
            </button>
          </div>

          {/* Tab kontenti */}
          {activeTab === 'SAVED_CARD' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Saqlangan bank kartalari
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddCardOpen(true)}
                  className="text-xs h-7 gap-1 text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Plus className="size-3.5" />
                  <span>Yangi karta</span>
                </Button>
              </div>

              {isCardsLoading ? (
                <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Kartalar yuklanmoqda...</span>
                </div>
              ) : verifiedCards.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed text-center space-y-3">
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                    <CreditCard className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Saqlangan kartalar mavjud emas</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tezkor 1-Click to‘lov uchun bank kartangizni qo‘shing.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsAddCardOpen(true)}
                    className="gap-1.5 text-xs font-semibold"
                  >
                    <Plus className="size-4" />
                    <span>Karta qo‘shish</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {verifiedCards.map((c) => (
                    <CreditCardDisplay
                      key={c.id}
                      card={c}
                      selectable
                      selected={activeSelectedCardId === c.id}
                      onSelect={(card) => setSelectedCardId(card.id)}
                    />
                  ))}
                </div>
              )}

              <div className="pt-3">
                <Button
                  type="button"
                  onClick={handlePayWithCard}
                  disabled={
                    payWithCardMutation.isPending ||
                    verifiedCards.length === 0 ||
                    !activeSelectedCardId
                  }
                  className="w-full h-11 text-sm font-bold gap-2 cursor-pointer"
                >
                  {payWithCardMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>To‘lov amalga oshirilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="size-4 text-amber-300 fill-amber-300" />
                      <span>{formatPrice(totalAmount)} to‘lash (1-Click)</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'PAYME' && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-500/5 space-y-2">
                <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 font-bold text-sm">
                  <div className="size-2 rounded-full bg-cyan-500" />
                  <span>Payme orqali to‘lov</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  «To‘lovga o‘tish» tugmasini bosganingizdan so‘ng Payme xavfsiz to‘lov tizimiga yo‘naltirilasiz. To‘lov amalga oshirilgach, yana do‘konga qaytarilasiz.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => handleInitializeGateway('PAYME')}
                disabled={initializePaymentMutation.isPending}
                className="w-full h-11 text-sm font-bold bg-cyan-600 hover:bg-cyan-700 text-white gap-2 cursor-pointer"
              >
                {initializePaymentMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Payme ochilmoqda...</span>
                  </>
                ) : (
                  <>
                    <span>Payme orqali {formatPrice(totalAmount)} to‘lash</span>
                    <ExternalLink className="size-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {activeTab === 'CLICK' && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-500/5 space-y-2">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-sm">
                  <div className="size-2 rounded-full bg-blue-500" />
                  <span>Click Up orqali to‘lov</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  «To‘lovga o‘tish» tugmasini bosganingizdan so‘ng Click tizimiga yoki Click ilovasiga yo‘naltirilasiz. To‘lov tugagach, buyurtma avtomatik tasdiqlanadi.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => handleInitializeGateway('CLICK')}
                disabled={initializePaymentMutation.isPending}
                className="w-full h-11 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white gap-2 cursor-pointer"
              >
                {initializePaymentMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Click orqali ochilmoqda...</span>
                  </>
                ) : (
                  <>
                    <span>Click orqali {formatPrice(totalAmount)} to‘lash</span>
                    <ExternalLink className="size-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Karta qo'shish modali */}
      <AddCardModal
        isOpen={isAddCardOpen}
        onClose={() => setIsAddCardOpen(false)}
        onCardAdded={(cardId) => {
          setSelectedCardId(cardId);
          setIsAddCardOpen(false);
        }}
      />
    </>
  );
}
