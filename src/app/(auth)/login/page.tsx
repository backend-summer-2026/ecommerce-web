'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, LogIn, Mail, Lock, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/authSchemas';
import { authApi, parseApiError } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setUnverifiedEmail(null);
    try {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
      });

      const user = response.user;
      const accessToken = response.access || response.tokens?.access;
      const refreshToken = response.refresh || response.tokens?.refresh;

      setAuth(user, accessToken, refreshToken);
      toast.success(response.message || 'Xush kelibsiz! Tizimga muvaffaqiyatli kirdingiz.');

      // Yo'naltirish: agar redirect ko'rsatilgan bo'lsa yoki admin bo'lsa /admin ga, aks holda /profile ga
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (user.role?.toLowerCase() === 'admin') {
        router.push('/admin');
      } else {
        router.push('/profile');
      }
    } catch (err) {
      const errorMsg = parseApiError(err);
      toast.error(errorMsg);

      // Agar hisob tasdiqlanmagan bo'lsa, OTP sahifasiga tezkor havola chiqaramiz
      if (errorMsg.toLowerCase().includes('not been verified') || errorMsg.toLowerCase().includes('otp')) {
        setUnverifiedEmail(data.email);
      }
    }
  };

  return (
    <Card className="shadow-lg border-muted">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <LogIn className="size-5" />
          </div>
          <CardTitle className="text-xl font-bold">Hisobga kirish</CardTitle>
        </div>
        <CardDescription>
          ApexShop platformasiga kirish uchun elektron pochta va parolingizni kiriting
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
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
              <Link
                href={`/verify-otp?email=${encodeURIComponent(unverifiedEmail)}`}
                className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
              >
                Kodni tasdiqlash sahifasiga o'tish &rarr;
              </Link>
            </div>
          )}

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
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Parol */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none" htmlFor="password">
                Parol
              </label>
              <Link
                href="/verify-otp"
                className="text-xs text-primary font-medium hover:underline"
              >
                OTP orqali kirish
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="pl-9 pr-9"
                {...register('password')}
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
            {errors.password && (
              <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Kirilmoqda...</span>
              </>
            ) : (
              <span>Kirish</span>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Hisobingiz yo'qmi?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Ro'yxatdan o'tish
            </Link>
          </p>
        </CardFooter>
      </form>
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
