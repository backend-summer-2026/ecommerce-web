'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  LogOut,
  Save,
  Loader2,
  Package,
  CreditCard,
  Bell,
  LayoutDashboard,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { profileUpdateSchema, type ProfileUpdateFormData } from '@/features/auth/schemas/authSchemas';
import { authApi, parseApiError } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, updateUserProfile, fetchProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone_number: user?.phone_number || '',
    },
  });

  // Foydalanuvchi ma'lumotlari yangilanganda formani to'ldirish
  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
      });
    }
  }, [user, reset]);

  // Auth holatini yuklash
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/profile');
    }
  }, [isLoading, isAuthenticated, router]);

  const onUpdateProfile = async (data: ProfileUpdateFormData) => {
    try {
      const updatedUser = await authApi.updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number || null,
      });

      updateUserProfile(updatedUser);
      setIsEditing(false);
      toast.success('Profil ma\'lumotlari muvaffaqiyatli saqlandi!');
      await fetchProfile();
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Hisobingizdan muvaffaqiyatli chiqdingiz');
    router.push('/login');
  };

  if (isLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 md:col-span-2 rounded-xl" />
        </div>
      </div>
    );
  }

  const isAdmin = user.role?.toLowerCase() === 'admin';
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Foydalanuvchi';
  const initials = (user.first_name?.[0] || '') + (user.last_name?.[0] || '') || user.email[0].toUpperCase();

  const formattedDate = user.created_at
    ? format(new Date(user.created_at), 'dd.MM.yyyy')
    : 'Yaqinda';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* Profil Banneri */}
      <Card className="overflow-hidden border-muted shadow-sm">
        <div className="h-24 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        <CardContent className="relative pt-0 pb-6 px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12">
            <div className="flex items-end gap-4">
              <div className="size-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-md ring-4 ring-background">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{fullName}</h1>
                  <Badge variant={isAdmin ? 'default' : 'secondary'} className="capitalize">
                    {isAdmin ? 'Admin' : 'Mijoz'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Mail className="size-3.5" />
                  <span>{user.email}</span>
                  <span title="Tasdiqlangan">
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                  </span>
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5 self-end"
            >
              <LogOut className="size-4" />
              <span>Chiqish</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Tezkor Bo'limlar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">
                Tezkor navigatsiya
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition"
                >
                  <LayoutDashboard className="size-4" />
                  <span>Admin Panel</span>
                </Link>
              )}
              <Link
                href="/orders"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition"
              >
                <Package className="size-4 text-muted-foreground" />
                <span>Mening buyurtmalarim</span>
              </Link>
              <Link
                href="/profile/cards"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition"
              >
                <CreditCard className="size-4 text-muted-foreground" />
                <span>Bank kartalari</span>
              </Link>
              <Link
                href="/notifications"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition"
              >
                <Bell className="size-4 text-muted-foreground" />
                <span>Bildirishnomalar</span>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5" />
                <span>A'zolik sanasi: {formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                <span>Hisob holati: Faol va himoyalangan</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profil Ma'lumotlarini Tahrirlash Formasi */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-bold">Shaxsiy ma'lumotlar</CardTitle>
              <CardDescription>
                Profilingizdagi asosiy ma'lumotlarni ko'rishingiz va yangilashingiz mumkin
              </CardDescription>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Tahrirlash
              </Button>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="profile_first_name">
                    Ism
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="profile_first_name"
                      disabled={!isEditing}
                      className="pl-9"
                      {...register('first_name')}
                    />
                  </div>
                  {errors.first_name && (
                    <p className="text-xs text-destructive">{errors.first_name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="profile_last_name">
                    Familiya
                  </label>
                  <Input
                    id="profile_last_name"
                    disabled={!isEditing}
                    {...register('last_name')}
                  />
                  {errors.last_name && (
                    <p className="text-xs text-destructive">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Elektron pochta</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      value={user.email}
                      disabled
                      className="pl-9 bg-muted/50 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Elektron pochta tizim identifikatori sifatida o'zgartirilmaydi
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="profile_phone">
                    Telefon raqami
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="profile_phone"
                      type="tel"
                      placeholder="+998 90 123 45 67"
                      disabled={!isEditing}
                      className="pl-9"
                      {...register('phone_number')}
                    />
                  </div>
                  {errors.phone_number && (
                    <p className="text-xs text-destructive">{errors.phone_number.message}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      reset();
                      setIsEditing(false);
                    }}
                    disabled={isSubmitting}
                  >
                    Bekor qilish
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Saqlanmoqda...</span>
                      </>
                    ) : (
                      <>
                        <Save className="size-4" />
                        <span>O'zgarishlarni saqlash</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
