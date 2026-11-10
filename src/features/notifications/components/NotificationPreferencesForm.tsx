'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  ShieldCheck,
  Package,
  CreditCard,
  Sparkles,
  Save,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '../hooks/useNotifications';
import type { NotificationPreferenceUpdatePayload } from '@/types/notifications';
import { cn } from '@/lib/utils';

interface SwitchToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

function SwitchToggle({
  checked,
  onChange,
  disabled,
  id,
  label,
  description,
  icon,
}: SwitchToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl border bg-card hover:bg-muted/30 transition">
      <div className="flex items-start gap-3">
        {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}
        <div className="space-y-0.5">
          <label
            htmlFor={id}
            className="text-sm font-semibold text-foreground cursor-pointer select-none"
          >
            {label}
          </label>
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1',
          checked ? 'bg-primary' : 'bg-input'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}

export function NotificationPreferencesForm() {
  const { data: preferences, isLoading, refetch } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();

  const [formData, setFormData] = useState<NotificationPreferenceUpdatePayload>({
    in_app_order_updates: true,
    in_app_payment_updates: true,
    in_app_promotions: true,
    email_order_updates: true,
    email_payment_receipts: true,
    email_promotions: true,
    email_security_alerts: true,
  });

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (preferences) {
      setFormData({
        in_app_order_updates: preferences.in_app_order_updates,
        in_app_payment_updates: preferences.in_app_payment_updates,
        in_app_promotions: preferences.in_app_promotions,
        email_order_updates: preferences.email_order_updates,
        email_payment_receipts: preferences.email_payment_receipts,
        email_promotions: preferences.email_promotions,
        email_security_alerts: preferences.email_security_alerts,
      });
      setIsDirty(false);
    }
  }, [preferences]);

  const handleChange = (key: keyof NotificationPreferenceUpdatePayload, val: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [key]: val,
    }));
    setIsDirty(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync(formData);
    setIsDirty(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Sayt ichidagi xabarnomalar (In-App) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">
                Sayt ichidagi xabarnomalar (In-App)
              </CardTitle>
              <CardDescription className="text-xs">
                Platformadagi qo'ng'iroqcha darchasida ko'rinadigan bildirishnomalar
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-2">
          <SwitchToggle
            id="in_app_order"
            checked={Boolean(formData.in_app_order_updates)}
            onChange={(val) => handleChange('in_app_order_updates', val)}
            label="Buyurtmalar holati"
            description="Buyurtmangiz qabul qilingani, jo'natilgani yoki yetkazilgani haqida tezkor xabarlar"
            icon={<Package className="size-4 text-blue-500" />}
          />

          <SwitchToggle
            id="in_app_payment"
            checked={Boolean(formData.in_app_payment_updates)}
            onChange={(val) => handleChange('in_app_payment_updates', val)}
            label="To‘lov va mablag‘lar"
            description="Muvaffaqiyatli to'lovlar, qaytarilgan summalar va hisob-kitoblar haqida ogohlantirishlar"
            icon={<CreditCard className="size-4 text-emerald-500" />}
          />

          <SwitchToggle
            id="in_app_promo"
            checked={Boolean(formData.in_app_promotions)}
            onChange={(val) => handleChange('in_app_promotions', val)}
            label="Chegirmalar va aksiyalar"
            description="Maxsus promo-kodlar, bayram aksiyalari va do'kon takliflari"
            icon={<Sparkles className="size-4 text-amber-500" />}
          />
        </CardContent>
      </Card>

      {/* Elektron pochta xabarnomalari (Email) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Mail className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">
                Elektron pochta xabarnomalari (Email)
              </CardTitle>
              <CardDescription className="text-xs">
                Profilingizga biriktirilgan pochtangizga yuboriladigan xabarlar
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-2">
          <SwitchToggle
            id="email_order"
            checked={Boolean(formData.email_order_updates)}
            onChange={(val) => handleChange('email_order_updates', val)}
            label="Buyurtma xatlari"
            description="Buyurtma tasdig'i, schyot-faktura (invoice) va kuryer orqali yetkazish yangiliklari"
            icon={<Package className="size-4 text-blue-500" />}
          />

          <SwitchToggle
            id="email_payment"
            checked={Boolean(formData.email_payment_receipts)}
            onChange={(val) => handleChange('email_payment_receipts', val)}
            label="To‘lov kvitansiyalari"
            description="Tranzaksiya cheklari, to'lov muvaffaqiyati yoki bekor qilingani to'g'risidagi kvitansiyalar"
            icon={<CreditCard className="size-4 text-emerald-500" />}
          />

          <SwitchToggle
            id="email_promo"
            checked={Boolean(formData.email_promotions)}
            onChange={(val) => handleChange('email_promotions', val)}
            label="Email yangiliklar va aksiyalar"
            description="Mavsumiy chegirmalar, yangi tovarlar katalogi va shaxsiy takliflar xabarnomalari"
            icon={<Sparkles className="size-4 text-amber-500" />}
          />

          <SwitchToggle
            id="email_security"
            checked={Boolean(formData.email_security_alerts)}
            onChange={(val) => handleChange('email_security_alerts', val)}
            label="Xavfsizlik ogohlantirishlari"
            description="Yangi qurilmadan kirish, parolni yangilash va hisobingiz xavfsizligi bo'yicha muhim eslatmalar"
            icon={<ShieldCheck className="size-4 text-violet-500" />}
          />
        </CardContent>
      </Card>

      {/* Saqlash paneli */}
      <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/40">
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <CheckCircle2 className="size-4 text-emerald-500" />
          <span>O'zgarishlar saqlangandan so'ng darhol kuchga kiradi</span>
        </div>

        <div className="flex items-center gap-3">
          {isDirty && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (preferences) {
                  setFormData({
                    in_app_order_updates: preferences.in_app_order_updates,
                    in_app_payment_updates: preferences.in_app_payment_updates,
                    in_app_promotions: preferences.in_app_promotions,
                    email_order_updates: preferences.email_order_updates,
                    email_payment_receipts: preferences.email_payment_receipts,
                    email_promotions: preferences.email_promotions,
                    email_security_alerts: preferences.email_security_alerts,
                  });
                  setIsDirty(false);
                }
              }}
              disabled={updateMutation.isPending}
              className="text-xs"
            >
              Bekor qilish
            </Button>
          )}

          <Button
            type="submit"
            size="sm"
            disabled={!isDirty || updateMutation.isPending}
            className="gap-2 text-xs font-semibold shadow-xs"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Saqlanmoqda...</span>
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                <span>Sozlamalarni saqlash</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
