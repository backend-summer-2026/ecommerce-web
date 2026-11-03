'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, UserPlus, Mail, Lock, Phone, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { registerSchema, type RegisterFormData } from '@/features/auth/schemas/authSchemas';
import { authApi, parseApiError } from '@/features/auth/api/authApi';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      password: '',
      password_confirm: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await authApi.register({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone_number: data.phone_number || undefined,
        password: data.password,
        password_confirm: data.password_confirm,
      });

      toast.success(
        response.message || 'Ro\'yxatdan o\'tish muvaffaqiyatli! Tasdiqlash kodi emailingizga yuborildi.'
      );

      // OTP tasdiqlash sahifasiga yo'naltirish
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  return (
    <Card className="shadow-lg border-muted">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <UserPlus className="size-5" />
          </div>
          <CardTitle className="text-xl font-bold">Ro'yxatdan o'tish</CardTitle>
        </div>
        <CardDescription>
          ApexShop do'konida qulay xaridlar qilish uchun yangi hisob yarating
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
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
                  {...register('first_name')}
                />
              </div>
              {errors.first_name && (
                <p className="text-xs text-destructive font-medium">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none" htmlFor="last_name">
                Familiya
              </label>
              <Input
                id="last_name"
                placeholder="Valiyev"
                {...register('last_name')}
              />
              {errors.last_name && (
                <p className="text-xs text-destructive font-medium">{errors.last_name.message}</p>
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
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
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
                {...register('phone_number')}
              />
            </div>
            {errors.phone_number && (
              <p className="text-xs text-destructive font-medium">{errors.phone_number.message}</p>
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
                {...register('password_confirm')}
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
            {errors.password_confirm && (
              <p className="text-xs text-destructive font-medium">{errors.password_confirm.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Yuborilmoqda...</span>
              </>
            ) : (
              <span>Ro'yxatdan o'tish</span>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Hisobingiz bormi?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Kirish
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
