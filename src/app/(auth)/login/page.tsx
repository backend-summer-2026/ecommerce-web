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
  LogIn,
  Mail,
  Lock,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  type LoginFormData,
  type SendOtpFormData,
  type VerifyOtpFormData,
} from '@/features/auth/schemas/authSchemas';
import { authApi, parseApiError } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { User } from '@/types/auth';

const RESEND_COOLDOWN_SECONDS = 60;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const urlEmail = searchParams.get('email') || '';
  const urlMode = searchParams.get('mode');

  const { setAuth } = useAuthStore();

  // Kirish rejimi: 'password' (parol bilan) yoki 'otp' (emailga yuboriladigan bir martalik kod bilan)
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>(
    urlMode === 'otp' ? 'otp' : 'password'
  );

  // OTP rejimining ichki bosqichi: 'send' (kod so'rash) yoki 'verify' (kodni kiritish)
  const [otpStep, setOtpStep] = useState<'send' | 'verify'>('send');
  const [otpEmail, setOtpEmail] = useState<string>(urlEmail);
  const [countdown, setCountdown] = useState<number>(0);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Parol bilan kirish formasi
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: urlEmail,
      password: '',
    },
  });

  // 2. OTP yuborish formasi
  const {
    register: registerOtpSend,
    handleSubmit: handleOtpSendSubmit,
    setValue: setOtpSendValue,
    formState: { errors: otpSendErrors, isSubmitting: isOtpSendSubmitting },
  } = useForm<SendOtpFormData>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: {
      email: urlEmail,
    },
  });

  // 3. OTP tasdiqlash formasi
  const {
    register: registerOtpVerify,
    handleSubmit: handleOtpVerifySubmit,
    setValue: setOtpVerifyValue,
    formState: { errors: otpVerifyErrors, isSubmitting: isOtpVerifySubmitting },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: urlEmail,
      code: '',
    },
  });

  // Taymer boshqaruvi
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

  // Verify bosqichiga o'tganda OTP inputiga fokus berish
  useEffect(() => {
    if (loginMode === 'otp' && otpStep === 'verify') {
      const timer = setTimeout(() => {
        otpInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [loginMode, otpStep]);

  // Muvaffaqiyatli autentifikatsiyadan so'ng yo'naltirish
  const handleAuthSuccess = (response: {
    message?: string;
    user: User;
    tokens?: { access: string; refresh: string };
    access?: string;
    refresh?: string;
  }) => {
    const user = response.user;
    const accessToken = response.access || response.tokens?.access;
    const refreshToken = response.refresh || response.tokens?.refresh;

    if (!accessToken) {
      throw new Error('Serverdan token olinmadi');
    }

    setAuth(user, accessToken, refreshToken);
    toast.success(response.message || 'Xush kelibsiz! Profilingizga muvaffaqiyatli kirdingiz.');

    if (redirectUrl) {
      router.push(redirectUrl);
    } else if (user?.role?.toLowerCase() === 'admin') {
      router.push('/admin');
    } else {
      router.push('/profile');
    }
  };

  // 1. Parol orqali kirish
  const onPasswordLogin = async (data: LoginFormData) => {
    setUnverifiedEmail(null);
    try {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
      });
      handleAuthSuccess(response);
    } catch (err) {
      const errorMsg = parseApiError(err);
      toast.error(errorMsg);

      if (
        errorMsg.toLowerCase().includes('not been verified') ||
        errorMsg.toLowerCase().includes('tasdiqlanmagan')
      ) {
        setUnverifiedEmail(data.email);
      }
    }
  };

  // 2. Emailga OTP kod yuborish
  const onSendOtp = async (data: SendOtpFormData) => {
    try {
      const response = await authApi.sendOtp({ email: data.email });
      setOtpEmail(data.email);
      setOtpVerifyValue('email', data.email, { shouldValidate: true });
      setOtpStep('verify');
      setCountdown(RESEND_COOLDOWN_SECONDS);

      const msg = response.message || 'Tasdiqlash kodi emailingizga yuborildi';
      toast.success(
        response.otp_code ? `${msg} (Test kodi: ${response.otp_code})` : msg
      );
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  // 3. OTP kodni qayta yuborish
  const onResendOtp = async () => {
    if (!otpEmail || countdown > 0 || isResending) return;

    setIsResending(true);
    try {
      const response = await authApi.resendOtp({ email: otpEmail });
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

  // 4. OTP kodni tasdiqlash va profilga kirish
  const onVerifyOtp = async (data: VerifyOtpFormData) => {
    const targetEmail = (data.email || otpEmail).trim();
    if (!targetEmail) {
      toast.error("Elektron pochta manzili ko'rsatilmagan");
      return;
    }

    try {
      const response = await authApi.verifyOtp({
        email: targetEmail,
        code: data.code,
      });
      handleAuthSuccess(response);
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  const { ref: otpFormRef, ...otpInputProps } = registerOtpVerify('code');

  return (
    <Card className="shadow-lg border-muted">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            {loginMode === 'otp' ? <KeyRound className="size-5" /> : <LogIn className="size-5" />}
          </div>
          <div>
            <CardTitle className="text-xl font-bold">
              {loginMode === 'otp' ? 'Email OTP orqali profilga kirish' : 'Hisobga kirish'}
            </CardTitle>
          </div>
        </div>
        <CardDescription>
          {loginMode === 'otp'
            ? 'Elektron pochtangizga bir martalik tasdiqlash kodi yuboriladi va profilingizga kirasiz'
            : 'ApexShop do\'koniga xush kelibsiz! Parolingiz bilan hisobingizga kiring'}
        </CardDescription>

        {/* Kirish turi tanlagichi (Tabs) */}
        <div className="grid grid-cols-2 p-1 rounded-lg bg-muted text-xs font-semibold gap-1">
          <button
            type="button"
            onClick={() => setLoginMode('password')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md transition ${
              loginMode === 'password'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Lock className="size-3.5" />
            <span>Parol bilan</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('otp');
              if (urlEmail && !otpEmail) {
                setOtpEmail(urlEmail);
                setOtpSendValue('email', urlEmail);
              }
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md transition ${
              loginMode === 'otp'
                ? 'bg-background text-primary shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <KeyRound className="size-3.5" />
            <span>Email OTP kodi bilan</span>
          </button>
        </div>
      </CardHeader>

      {/* REJIM 1: PAROL BILAN KIRISH */}
      {loginMode === 'password' && (
        <form onSubmit={handlePasswordSubmit(onPasswordLogin)}>
          <CardContent className="space-y-4">
            {unverifiedEmail && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
                <div className="flex items-center gap-2 font-medium">
                  <ShieldAlert className="size-4 shrink-0" />
                  <span>Hisobingiz hali tasdiqlanmagan!</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ro'yxatdan o'tishni yakunlash uchun emailingizga yuborilgan OTP kodni kiriting.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('otp');
                    setOtpEmail(unverifiedEmail);
                    setOtpSendValue('email', unverifiedEmail);
                    setOtpVerifyValue('email', unverifiedEmail);
                    setOtpStep('verify');
                  }}
                  className="mt-2 inline-block text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Kodni tasdiqlash sahifasiga o'tish &rarr;
                </button>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none" htmlFor="password_email">
                Elektron pochta
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password_email"
                  type="email"
                  autoComplete="email"
                  placeholder="user@example.com"
                  className="pl-9"
                  {...registerPassword('email')}
                />
              </div>
              {passwordErrors.email && (
                <p className="text-xs text-destructive font-medium">
                  {passwordErrors.email.message}
                </p>
              )}
            </div>

            {/* Parol */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none" htmlFor="password_field">
                  Parol
                </label>
                <button
                  type="button"
                  onClick={() => setLoginMode('otp')}
                  className="text-xs text-primary font-medium hover:underline cursor-pointer"
                >
                  Parolni unutdingizmi? (OTP orqali kirish)
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password_field"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  {...registerPassword('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {passwordErrors.password && (
                <p className="text-xs text-destructive font-medium">
                  {passwordErrors.password.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full gap-2" disabled={isPasswordSubmitting}>
              {isPasswordSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Kirilmoqda...</span>
                </>
              ) : (
                <span>Kirish</span>
              )}
            </Button>

            <div className="flex items-center justify-between w-full text-xs text-muted-foreground pt-1">
              <span>Hisobingiz yo'qmi?</span>
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Ro'yxatdan o'tish
              </Link>
            </div>
          </CardFooter>
        </form>
      )}

      {/* REJIM 2: EMAIL OTP ORQALI KIRISH */}
      {loginMode === 'otp' && (
        <>
          {otpStep === 'send' ? (
            /* BOSQICH 1: EMAIL KIRITISH VA KOD SO'RASH */
            <form onSubmit={handleOtpSendSubmit(onSendOtp)}>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground flex items-start gap-2.5">
                  <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Parol eslab qolish shart emas! Elektron pochtangizga 6 xonali tasdiqlash kodi
                    yuboriladi va profilingizga to'g'ridan-to'g'ri kirasiz.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none" htmlFor="otp_email_input">
                    Elektron pochta manzilingiz
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="otp_email_input"
                      type="email"
                      autoComplete="email"
                      placeholder="user@example.com"
                      className="pl-9"
                      {...registerOtpSend('email')}
                    />
                  </div>
                  {otpSendErrors.email && (
                    <p className="text-xs text-destructive font-medium">
                      {otpSendErrors.email.message}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full gap-2" disabled={isOtpSendSubmitting}>
                  {isOtpSendSubmitting ? (
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
                  <button
                    type="button"
                    onClick={() => setLoginMode('password')}
                    className="text-primary hover:underline font-medium cursor-pointer"
                  >
                    Parol bilan kirish
                  </button>
                  <Link href="/register" className="hover:underline">
                    Yangi hisob yaratish
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            /* BOSQICH 2: EMAILGA KELGAN KODNI TASDIQLASH */
            <form onSubmit={handleOtpVerifySubmit(onVerifyOtp)}>
              <CardContent className="space-y-4">
                <input type="hidden" {...registerOtpVerify('email')} value={otpEmail} />

                {/* Yuborilgan email ma'lumoti */}
                <div className="rounded-lg border bg-muted/40 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="rounded-full bg-primary/10 p-1 text-primary shrink-0">
                      <Mail className="size-3.5" />
                    </div>
                    <div className="truncate">
                      <p className="text-[11px] text-muted-foreground">Tasdiqlash kodi yuborildi:</p>
                      <p className="text-xs font-semibold text-foreground truncate">{otpEmail}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpStep('send')}
                    className="text-xs text-primary font-medium hover:underline shrink-0 ml-2 cursor-pointer"
                  >
                    O'zgartirish
                  </button>
                </div>

                {/* 6 xonali tasdiqlash kodi */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium leading-none" htmlFor="login_otp_code">
                      6 xonali tasdiqlash kodi
                    </label>
                    <span className="text-[11px] text-muted-foreground">Pochtani tekshiring</span>
                  </div>

                  <Input
                    id="login_otp_code"
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
                  {otpVerifyErrors.code && (
                    <p className="text-xs text-destructive font-medium">
                      {otpVerifyErrors.code.message}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    Emailingizdagi Asosiy yoki <strong>Spam</strong> bo'limini tekshiring. Kod 5 daqiqa amal qiladi.
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
                <Button type="submit" className="w-full gap-2" disabled={isOtpVerifySubmitting}>
                  {isOtpVerifySubmitting ? (
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
                    onClick={() => setOtpStep('send')}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    Emailni o'zgartirish
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMode('password')}
                    className="hover:underline cursor-pointer"
                  >
                    Parol bilan kirish
                  </button>
                </div>
              </CardFooter>
            </form>
          )}
        </>
      )}
    </Card>
  );
}

export default function LoginPage() {
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
      <LoginForm />
    </Suspense>
  );
}
