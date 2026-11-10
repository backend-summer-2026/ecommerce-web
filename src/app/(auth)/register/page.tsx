'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  Mail,
  Lock,
  Phone,
  User as UserIcon,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  registerSchema,
  verifyOtpSchema,
  type RegisterFormData,
  type VerifyOtpFormData,
} from '@/features/auth/schemas/authSchemas';
import { authApi, parseApiError } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';

const RESEND_COOLDOWN_SECONDS = 60;

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get('email') || '';
  const urlStep = searchParams.get('step');
  const urlCode = searchParams.get('code') || searchParams.get('otp') || '';
  const redirectUrl = searchParams.get('redirect');

  const { setAuth } = useAuthStore();
  const [customStep, setCustomStep] = useState<'register' | 'verify' | null>(null);
  const [customEmail, setCustomEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [isResending, setIsResending] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  const email = customEmail ?? urlEmail;
  const step = customStep ?? (urlStep === 'verify' || Boolean(urlEmail) ? 'verify' : 'register');

  // 1-bosqich: Ro'yxatdan o'tish formasi
  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: urlEmail,
      phone_number: '',
      password: '',
      password_confirm: '',
    },
  });

  // 2-bosqich: OTP kodni tasdiqlash formasi
  const {
    register: verifyForm,
    handleSubmit: handleVerifySubmit,
    setValue: setVerifyValue,
    formState: { errors: verifyErrors, isSubmitting: isVerifySubmitting },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: urlEmail,
      code: urlCode,
    },
  });

  // 2-bosqichga o'tganda OTP inputga fokus berish
  useEffect(() => {
    if (step === 'verify') {
      const focusTimer = setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
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

  // 1-bosqich submit: Ro'yxatdan o'tish va kod yuborish
  const onRegister = async (data: RegisterFormData) => {
    try {
      const response = await authApi.register({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number || undefined,
        password: data.password,
        password_confirm: data.password_confirm,
      });

      setCustomEmail(data.email);
      setVerifyValue('email', data.email, { shouldValidate: true });
      setCustomStep('verify');
      setCountdown(RESEND_COOLDOWN_SECONDS);

      toast.success(
        response.message || 'Ro\'yxatdan o\'tish muvaffaqiyatli! Tasdiqlash kodi emailingizga yuborildi.'
      );
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  // OTP kodni qayta yuborish
  const onResendOtp = async () => {
    if (!email || countdown > 0 || isResending) return;

    setIsResending(true);
    try {
      const response = await authApi.resendOtp({ email });
      setCountdown(RESEND_COOLDOWN_SECONDS);
      toast.success(response.message || 'Yangi tasdiqlash kodi emailingizga yuborildi');
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setIsResending(false);
    }
  };

  // 2-bosqich submit: OTP kodni tasdiqlash va tizimga kirish
  const onVerifyOtp = async (data: VerifyOtpFormData) => {
    const targetEmail = (data.email || email).trim();
    if (!targetEmail) {
      toast.error('Elektron pochta manzili topilmadi');
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

      if (!user || !accessToken) {
        throw new Error('Serverdan kutilmagan javob keldi (token topilmadi)');
      }

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

  const { ref: otpFormRef, ...otpInputProps } = verifyForm('code');

  return (
    <Card className="shadow-lg border-muted">
      {/* Bosqichlar indikatori */}
      <div className="border-b px-6 py-3 bg-muted/20">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`flex size-5 items-center justify-center rounded-full text-[11px] font-bold ${
                step === 'register'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {step === 'verify' ? '✓' : '1'}
            </span>
            <span
              className={
                step === 'register'
                  ? 'font-semibold text-foreground'
                  : 'font-medium text-muted-foreground'
              }
            >
              Ma'lumotlar
            </span>
          </div>

          <div className="h-px flex-1 mx-3 bg-border" />

          <div className="flex items-center gap-2">
            <span
              className={`flex size-5 items-center justify-center rounded-full text-[11px] font-bold ${
                step === 'verify'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              2
            </span>
            <span
              className={
                step === 'verify'
                  ? 'font-semibold text-foreground'
                  : 'font-medium text-muted-foreground'
              }
            >
              Kodni tasdiqlash
            </span>
          </div>
        </div>
      </div>

      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            {step === 'register' ? (
              <UserPlus className="size-5" />
            ) : (
              <KeyRound className="size-5" />
            )}
          </div>
          <CardTitle className="text-xl font-bold">
            {step === 'register' ? "Ro'yxatdan o'tish" : 'Email kodini kiritish'}
          </CardTitle>
        </div>
        <CardDescription>
          {step === 'register'
            ? "ApexShop do'konida qulay xaridlar qilish uchun yangi hisob yarating"
            : 'Emailingizga yuborilgan 6 xonali tasdiqlash kodini kiriting'}
        </CardDescription>
      </CardHeader>

      {step === 'register' ? (
        /* 1-BOSQICH: MA'LUMOTLARNI KIRITISH */
        <form onSubmit={handleRegisterSubmit(onRegister)}>
          <CardContent className="space-y-4">
            {/* Ism va Familiya */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none" htmlFor="first_name">
                  Ism
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="first_name"
                    placeholder="Ali"
                    className="pl-9"
                    {...registerForm('first_name')}
                  />
                </div>
                {registerErrors.first_name && (
                  <p className="text-xs text-destructive font-medium">
                    {registerErrors.first_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none" htmlFor="last_name">
                  Familiya
                </label>
                <Input
                  id="last_name"
                  placeholder="Valiyev"
                  {...registerForm('last_name')}
                />
                {registerErrors.last_name && (
                  <p className="text-xs text-destructive font-medium">
                    {registerErrors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none" htmlFor="email">
                Elektron pochta
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="user@example.com"
                  className="pl-9"
                  {...registerForm('email')}
                />
              </div>
              {registerErrors.email && (
                <p className="text-xs text-destructive font-medium">
                  {registerErrors.email.message}
                </p>
              )}
            </div>

            {/* Telefon raqami */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none" htmlFor="phone_number">
                Telefon raqami (ixtiyoriy)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  className="pl-9"
                  {...registerForm('phone_number')}
                />
              </div>
              {registerErrors.phone_number && (
                <p className="text-xs text-destructive font-medium">
                  {registerErrors.phone_number.message}
                </p>
              )}
            </div>

            {/* Parol */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none" htmlFor="password">
                Parol
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Kamida 8 ta belgi"
                  className="pl-9 pr-9"
                  {...registerForm('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {registerErrors.password && (
                <p className="text-xs text-destructive font-medium">
                  {registerErrors.password.message}
                </p>
              )}
            </div>

            {/* Parolni tasdiqlash */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none" htmlFor="password_confirm">
                Parolni tasdiqlash
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password_confirm"
                  type={showPasswordConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Parolni qayta kiriting"
                  className="pl-9 pr-9"
                  {...registerForm('password_confirm')}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPasswordConfirm ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
                >
                  {showPasswordConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {registerErrors.password_confirm && (
                <p className="text-xs text-destructive font-medium">
                  {registerErrors.password_confirm.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full gap-2" disabled={isRegisterSubmitting}>
              {isRegisterSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Yuborilmoqda...</span>
                </>
              ) : (
                <span>Ro'yxatdan o'tish</span>
              )}
            </Button>

            <div className="flex flex-col items-center gap-1.5 text-center text-xs text-muted-foreground">
              <p>
                Hisobingiz bormi?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Kirish
                </Link>
              </p>
              <button
                type="button"
                onClick={() => setCustomStep('verify')}
                className="text-primary hover:underline font-medium"
              >
                Tasdiqlash kodingiz bormi? Kodni kiritish &rarr;
              </button>
            </div>
          </CardFooter>
        </form>
      ) : (
        /* 2-BOSQICH: EMAIL KODINI KIRITISH */
        <form onSubmit={handleVerifySubmit(onVerifyOtp)}>
          <CardContent className="space-y-4">
            {/* Yashirin email inputi */}
            <input type="hidden" {...verifyForm('email')} value={email} />

            {/* Email axborot kartochkasi */}
            <div className="rounded-lg border bg-muted/40 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="rounded-full bg-primary/10 p-1 text-primary shrink-0">
                  <Mail className="size-3.5" />
                </div>
                <div className="truncate">
                  <p className="text-[11px] text-muted-foreground">Tasdiqlash kodi yuborildi:</p>
                  <p className="text-xs font-semibold text-foreground truncate">
                    {email || 'Elektron pochta ko\'rsatilmagan'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCustomStep('register')}
                className="text-xs text-primary font-medium hover:underline shrink-0 ml-2"
              >
                O'zgartirish
              </button>
            </div>

            {/* Agar email kiritilmagan bo'lsa, email kiritish inputi */}
            {!email && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none" htmlFor="verify_email">
                  Elektron pochta
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="verify_email"
                    type="email"
                    placeholder="user@example.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => {
                      setCustomEmail(e.target.value);
                      setVerifyValue('email', e.target.value, { shouldValidate: true });
                    }}
                  />
                </div>
              </div>
            )}

            {/* 6 xonali tasdiqlash kodi inputi */}
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
                Email pochta qutingizni va agar kod kelmasa <strong className="text-foreground">Spam</strong> bo'limini tekshiring.
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
                  <ShieldCheck className="size-4" />
                  <span>Tasdiqlash va Kirish</span>
                </>
              )}
            </Button>

            <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => setCustomStep('register')}
                className="flex items-center gap-1 hover:text-foreground hover:underline"
              >
                <ArrowLeft className="size-3" />
                <span>Ma'lumotlarni o'zgartirish</span>
              </button>

              <Link href="/login" className="hover:text-primary hover:underline">
                Kirish sahifasi
              </Link>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}

export default function RegisterPage() {
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
      <RegisterContent />
    </Suspense>
  );
}