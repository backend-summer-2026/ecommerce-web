'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Loader2, Mail, ArrowLeft, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  sendOtpSchema,
  verifyOtpSchema,
  type SendOtpFormData,
  type VerifyOtpFormData,
} from '@/features/auth/schemas/authSchemas';
import { authApi, parseApiError } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get('email') || '';
  const urlOtp = searchParams.get('otp') || searchParams.get('code') || '';
  const redirectUrl = searchParams.get('redirect');

  const { setAuth } = useAuthStore();
  const [customEmail, setCustomEmail] = useState<string | null>(null);
  const [customStep, setCustomStep] = useState<'send' | 'verify' | null>(null);

  const email = (customEmail ?? urlEmail).trim();
  const step = customStep ?? (urlEmail ? 'verify' : 'send');

  const [countdown, setCountdown] = useState<number>(urlEmail ? RESEND_COOLDOWN_SECONDS : 0);
  const [isResending, setIsResending] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  // Send OTP form
  const {
    register: registerSend,
    handleSubmit: handleSendSubmit,
    formState: { errors: sendErrors, isSubmitting: isSendSubmitting },
  } = useForm<SendOtpFormData>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: {
      email: urlEmail,
    },
  });

  // Verify OTP form
  const {
    register: registerVerify,
    handleSubmit: handleVerifySubmit,
    setValue: setVerifyValue,
    formState: { errors: verifyErrors, isSubmitting: isVerifySubmitting },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: urlEmail,
      code: urlOtp,
    },
  });

  // Verify bosqichiga o'tganda OTP inputiga fokus
  useEffect(() => {
    if (step === 'verify') {
      const focusTimer = setTimeout(() => {
        otpInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(focusTimer);
    }
  }, [step]);

  // Taymerni yurgizish
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [countdown]);

  // 1-bosqich: OTP kod yuborish
  const onSendOtp = async (data: SendOtpFormData) => {
    try {
      const response = await authApi.sendOtp({ email: data.email });
      setCustomEmail(data.email);
      setVerifyValue('email', data.email, { shouldValidate: true });
      setCustomStep('verify');
      setCountdown(RESEND_COOLDOWN_SECONDS);

      const msg = response.message || 'Tasdiqlash kodi emailingizga yuborildi';
      toast.success(
        response.otp_code ? `${msg} (Test kodi: ${response.otp_code})` : msg
      );
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  // Kodni qayta yuborish
  const onResendOtp = async () => {
    if (!email || countdown > 0 || isResending) return;

    setIsResending(true);
    try {
      const response = await authApi.resendOtp({ email });
      setCountdown(RESEND_COOLDOWN_SECONDS);
      const msg = response.message || 'Yangi tasdiqlash kodi emailingizga yuborildi';
      toast.success(
        response.otp_code ? `${msg} (Test kodi: ${response.otp_code})` : msg
      );
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setIsResending(false);
    }
  };

  // 2-bosqich: OTP kodni tasdiqlash
  const onVerifyOtp = async (data: VerifyOtpFormData) => {
    const targetEmail = (data.email || email).trim();
    if (!targetEmail) {
      toast.error("Elektron pochta manzili ko'rsatilmagan");
      return;
    }

    try {
      const response = await authApi.verifyOtp({
        email: targetEmail,
        code: data.code,
      });

      const user = response.user;
      const accessToken = response.access || response.tokens?.access;
      const refreshToken = response.refresh || response.tokens?.refresh;

      if (!accessToken) {
        throw new Error('Serverdan kutilmagan javob keldi (token topilmadi)');
      }

      setAuth(user, accessToken, refreshToken);
      toast.success(response.message || 'Profilingizga muvaffaqiyatli kirdingiz!');

      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (user?.role?.toLowerCase() === 'admin') {
        router.push('/admin');
      } else {
        router.push('/profile');
      }
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  const { ref: otpFormRef, ...otpInputProps } = registerVerify('code');

  return (
    <Card className="shadow-lg border-muted">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <KeyRound className="size-5" />
          </div>
          <CardTitle className="text-xl font-bold">
            {step === 'send' ? 'OTP kod orqali profilga kirish' : 'Kodni tasdiqlash'}
          </CardTitle>
        </div>
        <CardDescription>
          {step === 'send'
            ? 'Profilingizga kirish yoki hisobni tasdiqlash uchun emailingizni kiriting'
            : `${email} manziliga yuborilgan 6 xonali tasdiqlash kodini kiriting`}
        </CardDescription>
      </CardHeader>

      {step === 'send' ? (
        <form onSubmit={handleSendSubmit(onSendOtp)}>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground flex items-start gap-2.5">
              <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
              <span>
                Elektron pochtangizga bir martalik tasdiqlash kodi yuboriladi. Kod orqali parolsiz
                to'g'ridan-to'g'ri profilingizga kirishingiz mumkin.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none" htmlFor="send_email">
                Elektron pochta manzilingiz
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="send_email"
                  type="email"
                  autoComplete="email"
                  placeholder="user@example.com"
                  className="pl-9"
                  {...registerSend('email')}
                />
              </div>
              {sendErrors.email && (
                <p className="text-xs text-destructive font-medium">{sendErrors.email.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full gap-2" disabled={isSendSubmitting}>
              {isSendSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Kod yuborilmoqda...</span>
                </>
              ) : (
                <>
                  <KeyRound className="size-4" />
                  <span>Emailga kod yuborish</span>
                </>
              )}
            </Button>

            <div className="flex items-center justify-between w-full text-xs text-muted-foreground pt-1">
              <Link href="/login" className="flex items-center gap-1 hover:text-foreground hover:underline">
                <ArrowLeft className="size-3" />
                <span>Parol bilan kirish</span>
              </Link>
              <Link href="/register" className="hover:underline">
                Ro'yxatdan o'tish
              </Link>
            </div>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={handleVerifySubmit(onVerifyOtp)}>
          <CardContent className="space-y-4">
            {/* Yashirin email inputi */}
            <input type="hidden" {...registerVerify('email')} value={email} />

            {/* Email axborot kartochkasi */}
            <div className="rounded-lg border bg-muted/40 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="rounded-full bg-primary/10 p-1 text-primary shrink-0">
                  <Mail className="size-3.5" />
                </div>
                <div className="truncate">
                  <p className="text-[11px] text-muted-foreground">Tasdiqlash kodi yuborildi:</p>
                  <p className="text-xs font-semibold text-foreground truncate">
                    {email || "Elektron pochta ko'rsatilmagan"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomStep('send')}
                className="text-xs text-primary font-medium hover:underline shrink-0 ml-2 cursor-pointer"
              >
                O'zgartirish
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none" htmlFor="code">
                  6 xonali tasdiqlash kodi
                </label>
                <span className="text-[11px] text-muted-foreground">SMTP orqali yuborildi</span>
              </div>

              <Input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="••••••"
                className="text-center font-mono text-2xl tracking-[0.4em] h-13 border-2 focus-visible:ring-primary"
                {...otpInputProps}
                ref={(node) => {
                  otpFormRef(node);
                  otpInputRef.current = node;
                }}
              />
              {verifyErrors.code && (
                <p className="text-xs text-destructive font-medium">{verifyErrors.code.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Email qutingizni va agar kod kelmasa <strong className="text-foreground">Spam</strong> bo'limini tekshiring. Kod 5 daqiqa amal qiladi.
              </p>
            </div>

            {/* Qayta yuborish taymeri */}
            <div className="flex items-center justify-between rounded-md bg-muted/30 p-2.5 text-xs text-muted-foreground">
              <span>Kod kelmadimi?</span>
              {countdown > 0 ? (
                <span className="font-mono font-medium text-foreground">
                  Qayta yuborish: {countdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onResendOtp}
                  disabled={isResending}
                  className="flex items-center gap-1 font-medium text-primary hover:underline disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`size-3 ${isResending ? 'animate-spin' : ''}`} />
                  <span>Kodni qayta yuborish</span>
                </button>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full gap-2" disabled={isVerifySubmitting}>
              {isVerifySubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Tasdiqlanmoqda...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Tasdiqlash va Profilga kirish</span>
                </>
              )}
            </Button>

            <div className="flex items-center justify-between w-full text-xs text-muted-foreground pt-1">
              <button
                type="button"
                onClick={() => setCustomStep('send')}
                className="flex items-center gap-1 hover:text-foreground hover:underline cursor-pointer"
              >
                <ArrowLeft className="size-3" />
                <span>Emailni o'zgartirish</span>
              </button>

              <Link href="/login" className="hover:text-primary hover:underline">
                Parol bilan kirish
              </Link>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Yuklanmoqda...</CardTitle>
          </CardHeader>
        </Card>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
