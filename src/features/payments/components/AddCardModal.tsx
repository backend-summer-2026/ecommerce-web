'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  useAddSavedCard,
  useVerifyCardOtp,
} from '@/features/payments/hooks/usePayments';
import { parsePaymentError } from '@/features/payments/api/paymentsApi';
import {
  detectCardBrand,
  formatCardNumber,
  formatCardExpiry,
  getCardBrandTheme,
} from '@/features/payments/utils/cardUtils';
import type { CardProvider, SavedCard } from '@/types/payments';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardAdded?: (cardId: number) => void;
  initialCardForVerification?: SavedCard | null;
}

interface InnerModalContentProps {
  onClose: () => void;
  onCardAdded?: (cardId: number) => void;
  initialCardForVerification?: SavedCard | null;
}

function InnerModalContent({
  onClose,
  onCardAdded,
  initialCardForVerification,
}: InnerModalContentProps) {
  const [step, setStep] = useState<'FORM' | 'OTP'>(() =>
    initialCardForVerification ? 'OTP' : 'FORM'
  );
  const [createdCardId, setCreatedCardId] = useState<number | null>(() =>
    initialCardForVerification ? initialCardForVerification.id : null
  );

  // Form maydonlari
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [provider, setProvider] = useState<CardProvider>('PAYME');

  // OTP maydoni va taymer
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const addCardMutation = useAddSavedCard();
  const verifyCardMutation = useVerifyCardOtp();

  // OTP taymer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  const brand = detectCardBrand(cardNumber);
  const theme = getCardBrandTheme(brand);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardExpiry(e.target.value);
    setExpiry(formatted);
  };

  // 1-qadam: Kartani ro'yxatdan o'tkazish
  const handleRegisterCard = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanNumber = cardNumber.replace(/\D/g, '');
    if (cleanNumber.length !== 16) {
      toast.error('Iltimos, 16 xonali to‘liq karta raqamini kiriting');
      return;
    }

    const cleanExpiry = expiry.replace(/\D/g, '');
    if (cleanExpiry.length !== 4) {
      toast.error('Iltimos, amal qilish muddatini MM/YY ko‘rinishida kiriting');
      return;
    }

    const month = cleanExpiry.slice(0, 2);
    const year = cleanExpiry.slice(2, 4);

    const monthNum = parseInt(month, 10);
    if (monthNum < 1 || monthNum > 12) {
      toast.error('Noto‘g‘ri oy kiritildi (01 dan 12 gacha)');
      return;
    }

    if (!cardHolder.trim()) {
      toast.error('Iltimos, karta egasining ism-familiyasini kiriting');
      return;
    }

    try {
      const res = await addCardMutation.mutateAsync({
        card_number: cleanNumber,
        expire_month: month,
        expire_year: year,
        card_holder: cardHolder.trim().toUpperCase(),
        provider,
      });

      setCreatedCardId(res.id);
      setStep('OTP');
      setTimer(60);
      setCanResend(false);
      toast.success(
        res.message || 'Tasdiqlash kodi karta ulangan telefon raqamiga yuborildi'
      );
    } catch (err) {
      toast.error(parsePaymentError(err));
    }
  };

  // 2-qadam: OTP kodni tasdiqlash
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdCardId) return;

    const cleanOtp = otpCode.trim();
    if (cleanOtp.length < 4) {
      toast.error('Iltimos, SMS kodni to‘liq kiriting');
      return;
    }

    try {
      const res = await verifyCardMutation.mutateAsync({
        card_id: createdCardId,
        otp_code: cleanOtp,
      });

      toast.success(res.message || 'Bank kartasi muvaffaqiyatli faollashtirildi!');
      if (onCardAdded) {
        onCardAdded(createdCardId);
      }
      onClose();
    } catch (err) {
      toast.error(parsePaymentError(err));
    }
  };

  // Qayta OTP so'rash
  const handleResendOtp = async () => {
    if (!canResend) return;
    try {
      const cleanNumber = cardNumber.replace(/\D/g, '');
      const cleanExpiry = expiry.replace(/\D/g, '');
      const month = cleanExpiry.slice(0, 2);
      const year = cleanExpiry.slice(2, 4);

      if (cleanNumber.length === 16) {
        await addCardMutation.mutateAsync({
          card_number: cleanNumber,
          expire_month: month,
          expire_year: year,
          card_holder: cardHolder.trim().toUpperCase(),
          provider,
        });
        setTimer(60);
        setCanResend(false);
        toast.success('Yangi tasdiqlash kodi yuborildi');
      }
    } catch (err) {
      toast.error(parsePaymentError(err));
    }
  };

  return (
    <div className="relative w-full max-w-lg rounded-2xl border bg-background p-6 shadow-2xl animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <CreditCard className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {step === 'FORM' ? 'Yangi bank kartasi qo‘shish' : 'Kartani SMS orqali tasdiqlash'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {step === 'FORM'
                ? 'Uzcard, Humo, Visa yoki Mastercard kartalari'
                : 'Xavfsiz 1-bosishda to‘lovlarni faollashtirish'}
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

      {step === 'FORM' ? (
        <form onSubmit={handleRegisterCard} className="mt-5 space-y-5">
          {/* Real-time Jonli Karta Predprosmotri */}
          <div
            className={`relative overflow-hidden rounded-2xl border p-5 shadow-md ${theme.bg} ${theme.border} text-white`}
          >
            <div className="flex items-center justify-between">
              <div className="h-6 w-8 rounded-md bg-amber-400 border border-amber-300 opacity-90 shadow-xs" />
              <Badge
                variant="outline"
                className="bg-black/30 text-white border-white/20 text-[10px] tracking-wider uppercase font-bold"
              >
                {theme.brandName}
              </Badge>
            </div>

            <div className="mt-5 mb-3 font-mono text-lg tracking-[0.2em] font-semibold">
              {cardNumber || '8600 •••• •••• ••••'}
            </div>

            <div className="flex items-end justify-between text-xs pt-1 border-t border-white/20">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-white/70 block">
                  Karta egasi
                </span>
                <span className="font-semibold uppercase tracking-wider line-clamp-1 max-w-[170px]">
                  {cardHolder || 'ISM FAMILIYA'}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-white/70 block text-right">
                  Muddati
                </span>
                <span className="font-mono font-semibold">
                  {expiry || 'MM/YY'}
                </span>
              </div>
            </div>
          </div>

          {/* Forma maydonlari */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" htmlFor="card_number">
                Karta raqami (16 xonali)
              </label>
              <div className="relative">
                <Input
                  id="card_number"
                  type="text"
                  inputMode="numeric"
                  placeholder="8600 0000 0000 0000"
                  maxLength={19}
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="font-mono tracking-wider pl-3.5 pr-20"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground border">
                    {theme.brandName}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold" htmlFor="card_expiry">
                  Amal qilish muddati
                </label>
                <Input
                  id="card_expiry"
                  type="text"
                  inputMode="numeric"
                  placeholder="12/28"
                  maxLength={5}
                  value={expiry}
                  onChange={handleExpiryChange}
                  className="font-mono text-center"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">
                  To‘lov shlyuzi
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setProvider('PAYME')}
                    className={`h-9 rounded-md border text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                      provider === 'PAYME'
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 ring-2 ring-cyan-400'
                        : 'border-input hover:bg-muted'
                    }`}
                  >
                    Payme
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvider('CLICK')}
                    className={`h-9 rounded-md border text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                      provider === 'CLICK'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-2 ring-blue-400'
                        : 'border-input hover:bg-muted'
                    }`}
                  >
                    Click
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold" htmlFor="card_holder">
                Karta egasining ismi va familiyasi
              </label>
              <Input
                id="card_holder"
                type="text"
                placeholder="CARDHOLDER NAME"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                className="uppercase"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={addCardMutation.isPending}
              className="gap-2 font-semibold"
            >
              {addCardMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>SMS yuborilmoqda...</span>
                </>
              ) : (
                <>
                  <span>Davom etish</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="mt-5 space-y-5">
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-center space-y-2">
            <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="text-sm font-bold">SMS tasdiqlash kodini kiriting</h3>
            <p className="text-xs text-muted-foreground">
              Karta ulangan telefon raqamingizga 6 xonali bir martalik tasdiqlash kodi yuborildi.
            </p>
          </div>

          <div className="space-y-2">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              className="text-center font-mono text-2xl tracking-[0.4em] h-12"
              autoFocus
              required
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              {timer > 0 ? (
                <span>Qayta yuborish: {timer} soniya</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={addCardMutation.isPending}
                  className="text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Kodni qayta yuborish</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setStep('FORM')}
                className="hover:underline cursor-pointer"
              >
                Ma’lumotlarni o‘zgartirish
              </button>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Yopish
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={verifyCardMutation.isPending || otpCode.length < 4}
              className="gap-2 font-semibold"
            >
              {verifyCardMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Tasdiqlanmoqda...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Kartani faollashtirish</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export function AddCardModal({
  isOpen,
  onClose,
  onCardAdded,
  initialCardForVerification = null,
}: AddCardModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content with auto reset key */}
      <InnerModalContent
        key={initialCardForVerification ? `verify-${initialCardForVerification.id}` : 'new-card'}
        onClose={onClose}
        onCardAdded={onCardAdded}
        initialCardForVerification={initialCardForVerification}
      />
    </div>
  );
}
