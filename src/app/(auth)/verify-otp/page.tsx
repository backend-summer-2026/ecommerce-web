'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Loader2, Mail, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
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
  const initialEmail = searchParams.get('email') || '';
  const redirectUrl = searchParams.get('redirect');

  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState<string>(initialEmail);
  const [step, setStep] = useState<'send' | 'verify'>(initialEmail ? 'verify' : 'send');
  const [countdown, setCountdown] = useState<number>(initialEmail ? RESEND_COOLDOWN_SECONDS : 0);
  const [isResending, setIsResending] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Send OTP form
  const {
    register: registerSend,
    handleSubmit: handleSendSubmit,
    formState: { errors: sendErrors, isSubmitting: isSendSubmitting },
  } = useForm<SendOtpFormData>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: {
      email: initialEmail,
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
      email: initialEmail,
      code: '',
    },
  });

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
      setEmail(data.email);
      setVerifyValue('email', data.email);
      setStep('verify');
      setCountdown(RESEND_COOLDOWN_SECONDS);
      toast.success(response.message || 'Tasdiqlash kodi emailingizga yuborildi');
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  // Kodni qayta yuborish
  const onResendOtp = async () => {
    if (!email || countdown > 0 || isResending) return;

    setIsResending(true);
    try {
      const response = await authApi.sendOtp({ email });
      setCountdown(RESEND_COOLDOWN_SECONDS);
      toast.success(response.message || 'Yangi tasdiqlash kodi emailingizga yuborildi');
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setIsResending(false);
    }
  };

  // 2-bosqich: OTP kodni tasdiqlash
  const onVerifyOtp = async (data: VerifyOtpFormData) => {
    try {
      const response = await authApi.verifyOtp({
        email: data.email,
        code: data.code,
      });

      const user = response.user;
      const accessToken = response.access || response.tokens?.access;
      const refreshToken = response.refresh || response.tokens?.refresh;

      setAuth(user, accessToken, refreshToken);
      toast.success(response.message || 'Hisobingiz muvaffaqiyatli tasdiqlandi!');

      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (user.role?.toLowerCase() === 'admin') {
        router.push('/admin');
      } else {
        router.push('/profile');
      }
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  return (
    <Card className="shadow-lg border-muted">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <KeyRound className="size-5" />
          </div>
          <CardTitle className="text-xl font-bold">
            {step === 'send' ? 'OTP kod olish' : 'Kodni tasdiqlash'}
          </CardTitle>
        </div>
        <CardDescription>
          {step === 'send'
            ? 'Bir martalik kirish yoki hisobni tasdiqlash uchun emailingizni kiriting'
            : `${email} manziliga yuborilgan 6 xonali tasdiqlash kodini kiriting`}
        </CardDescription>
      </CardHeader>

      {step === 'send' ? (
        <form onSubmit={handleSendSubmit(onSendOtp)}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none" htmlFor="send_email">
                Elektron pochta
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="send_email"
                  type="email"
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
                  <span>Yuborilmoqda...</span>
                </>
              ) : (
                <span>Kod yuborish</span>
              )}
            </Button>

            <Link href="/login" className="flex items-center gap-1 text-xs text-muted-foreground hover:underline">
              <ArrowLeft className="size-3" />
              <span>Parol bilan kirishga qaytish</span>
            </Link>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={handleVerifySubmit(onVerifyOtp)}>
          <CardContent className="space-y-4">
            {/* Yashirin email inputi */}
            <input type="hidden" {...registerVerify('email')} value={email} />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none" htmlFor="code">
                  6 xonali tasdiqlash kodi
                </label>
                <button
                  type="button"
                  onClick={() => setStep('send')}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Emailni o'zgartirish
                </button>
              </div>

              <Input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="••••••"
                className="text-center font-mono text-2xl tracking-[0.4em] h-12"
                {...registerVerify('code')}
              />
              {verifyErrors.code && (
                <p className="text-xs text-destructive font-medium">{verifyErrors.code.message}</p>
              )}
            </div>

            {/* Qayta yuborish taymeri */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Kod kelmadimi?</span>
              {countdown > 0 ? (
                <span className="font-mono text-muted-foreground">
                  Qayta yuborish ({countdown}s)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onResendOtp}
                  disabled={isResending}
                  className="flex items-center gap-1 font-medium text-primary hover:underline disabled:opacity-50"
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
                  <span>Tasdiqlash va Kirish</span>
                </>
              )}
            </Button>

            <Link href="/login" className="flex items-center gap-1 text-xs text-muted-foreground hover:underline">
              <ArrowLeft className="size-3" />
              <span>Parol bilan kirish sahifasiga qaytish</span>
            </Link>
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
