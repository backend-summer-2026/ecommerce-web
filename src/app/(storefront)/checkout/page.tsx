'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CreditCard,
  Tag,
  Check,
  AlertCircle,
  Loader2,
  User as UserIcon,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '@/features/cart/store/cartStore';
import {
  useCheckoutPreview,
  useCreateOrder,
} from '@/features/orders/hooks/useOrders';
import { ordersApi, parseOrderError } from '@/features/orders/api/ordersApi';
import {
  UZBEKISTAN_REGIONS,
  SHIPPING_METHOD_MAP,
} from '@/features/orders/utils/statusUtils';
import type {
  ShippingMethod,
  PaymentMethod,
  OrderAddress,
} from '@/types/orders';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  const { cart, itemCount, isLoading: isCartLoading, fetchCart } = useCartStore();

  const userDefaultName = user
    ? (user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '')
    : '';
  const userDefaultPhone = user?.phone_number || '+998';

  // Manzil formasi holati
  const [address, setAddress] = useState<OrderAddress>(() => ({
    recipient_name: '',
    phone_number: '',
    alternative_phone_number: '',
    region: 'Toshkent shahri',
    district: '',
    street_address: '',
    apartment_office: '',
    postal_code: '100000',
    landmark: '',
    delivery_instructions: '',
  }));

  // Savatchani yangilash
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Yetkazib berish va to'lov usullari
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_ON_DELIVERY');
  const [customerNotes, setCustomerNotes] = useState('');

  // Kupon holati
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Kassa hisob-kitob predprosmotri
  const {
    data: preview,
  } = useCheckoutPreview(
    {
      shipping_method: shippingMethod,
      coupon_code: appliedCoupon,
      region: address.region,
    },
    isAuthenticated && itemCount > 0
  );

  const createOrderMutation = useCreateOrder();

  const activeRecipientName = address.recipient_name || userDefaultName;
  const activePhoneNumber = address.phone_number || userDefaultPhone;

  // Kuponni tekshirish
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    try {
      setIsValidatingCoupon(true);
      const subtotal = preview?.subtotal || cart?.total_price || '0.00';
      const res = await ordersApi.validateCoupon(couponInput.trim().toUpperCase(), subtotal);

      if (res.is_valid) {
        setAppliedCoupon(res.code || couponInput.trim().toUpperCase());
        toast.success(res.message || 'Kupon muvaffaqiyatli qo‘llandi!');
      } else {
        toast.error(res.message || 'Kupon yaroqsiz');
      }
    } catch (err) {
      toast.error(parseOrderError(err));
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    toast.info('Kupon olib tashlandi');
  };

  // Buyurtmani rasmiylashtirish
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalRecipient = activeRecipientName.trim();
    const finalPhone = activePhoneNumber.trim();

    if (!finalRecipient) {
      toast.error('Iltimos, qabul qiluvchi ismini kiriting');
      return;
    }
    if (!finalPhone || finalPhone === '+998') {
      toast.error('Iltimos, telefon raqamingizni kiriting');
      return;
    }
    if (!address.street_address.trim()) {
      toast.error('Iltimos, ko‘cha va uy manzilini kiriting');
      return;
    }
    if (!address.district.trim()) {
      toast.error('Iltimos, tuman yoki shahar nomini kiriting');
      return;
    }

    try {
      const order = await createOrderMutation.mutateAsync({
        shipping_address: {
          ...address,
          recipient_name: finalRecipient,
          phone_number: finalPhone,
        },
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon,
        customer_notes: customerNotes.trim() || undefined,
      });

      toast.success(`Buyurtma #${order.order_number} muvaffaqiyatli qabul qilindi!`);
      router.push(`/orders/${order.order_number}`);
    } catch (err) {
      toast.error(parseOrderError(err));
    }
  };

  // 1. Agar foydalanuvchi tizimga kirmagan bo'lsa
  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 max-w-xl text-center space-y-6">
        <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <UserIcon className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Buyurtmani rasmiylashtirish</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Buyurtma berish, uni monitoring qilish va invoysni qabul qilish uchun shaxsiy hisobingizga
            kirishingiz yoki ro‘yxatdan o‘tishingiz kerak.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/login?redirect=/checkout" className="flex-1">
            <Button className="w-full font-semibold">Tizimga kirish</Button>
          </Link>
          <Link href="/register?redirect=/checkout" className="flex-1">
            <Button variant="outline" className="w-full font-semibold">
              Ro‘yxatdan o‘tish
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 2. Agar savatcha bo'sh bo'lsa
  if (!isCartLoading && itemCount === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 max-w-md text-center space-y-6">
        <div className="size-16 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
          <ShoppingBag className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Savatchangiz bo‘sh</h2>
          <p className="text-sm text-muted-foreground">
            Buyurtma berish uchun avval savatchangizga mahsulot qo‘shishingiz lozim.
          </p>
        </div>
        <Link href="/catalog">
          <Button className="gap-2 font-semibold">
            <span>Katalogga o‘tish</span>
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground transition-colors">
          Bosh sahifa
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/cart" className="hover:text-foreground transition-colors">
          Savatcha
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">Checkout</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Buyurtmani rasmiylashtirish
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Yetkazib berish manzili va to‘lov turini tasdiqlang
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Chap ustun: Yetkazib berish, To'lov va Izohlar */}
        <div className="lg:col-span-7 space-y-6">
          {/* Qadam 1: Yetkazib berish manzili */}
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <span>Yetkazib berish manzili</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Qabul qiluvchi ismi-sharifi <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    value={activeRecipientName}
                    onChange={(e) =>
                      setAddress((prev) => ({ ...prev, recipient_name: e.target.value }))
                    }
                    placeholder="Masalan: Alisher Navoiy"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Telefon raqami <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    value={activePhoneNumber}
                    onChange={(e) =>
                      setAddress((prev) => ({ ...prev, phone_number: e.target.value }))
                    }
                    placeholder="+998 90 123 45 67"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Viloyat <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={address.region}
                    onChange={(e) =>
                      setAddress((prev) => ({ ...prev, region: e.target.value }))
                    }
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-2xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {UZBEKISTAN_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Tuman / Shahar <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    value={address.district}
                    onChange={(e) =>
                      setAddress((prev) => ({ ...prev, district: e.target.value }))
                    }
                    placeholder="Masalan: Mirabod tumani"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Ko‘cha, uy raqami <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  value={address.street_address}
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, street_address: e.target.value }))
                  }
                  placeholder="Masalan: Amir Temur ko‘chasi, 15-uy"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Xonadon / Ofis</label>
                  <Input
                    value={address.apartment_office || ''}
                    onChange={(e) =>
                      setAddress((prev) => ({ ...prev, apartment_office: e.target.value }))
                    }
                    placeholder="24-xonadon"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Pochta indeksi</label>
                  <Input
                    value={address.postal_code || ''}
                    onChange={(e) =>
                      setAddress((prev) => ({ ...prev, postal_code: e.target.value }))
                    }
                    placeholder="100000"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Mo‘ljal (Landmark)</label>
                  <Input
                    value={address.landmark || ''}
                    onChange={(e) =>
                      setAddress((prev) => ({ ...prev, landmark: e.target.value }))
                    }
                    placeholder="Oybek metrosi yaqinida"
                    className="text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Qadam 2: Yetkazib berish usuli */}
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <span>Yetkazib berish usuli</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-5 space-y-3">
              {(['STANDARD', 'EXPRESS', 'PICKUP'] as ShippingMethod[]).map((method) => {
                const info = SHIPPING_METHOD_MAP[method];
                const isSelected = shippingMethod === method;

                return (
                  <label
                    key={method}
                    className={`flex items-start justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="shipping_method"
                        value={method}
                        checked={isSelected}
                        onChange={() => setShippingMethod(method)}
                        className="mt-1 accent-primary"
                      />
                      <div>
                        <div className="text-xs font-bold text-foreground flex items-center gap-2">
                          <span>{info.label}</span>
                          {method === 'STANDARD' && (
                            <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700">
                              Tavsiya etiladi
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{info.desc}</p>
                      </div>
                    </div>

                    <div className="text-right text-xs font-bold">
                      {method === 'EXPRESS' ? 'Tezkor (+haq evaziga)' : 'Bepul'}
                    </div>
                  </label>
                );
              })}
            </CardContent>
          </Card>

          {/* Qadam 3: To'lov usuli */}
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <span>To‘lov usulini tanlang</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-5 space-y-3">
              {(
                [
                  { id: 'PAYME', label: 'Payme', desc: 'Ilova yoki karta orqali onlayn to‘lov' },
                  { id: 'CLICK', label: 'Click', desc: 'Click Up orqali tezkor to‘lov' },
                  { id: 'UZUM', label: 'Uzum Bank', desc: 'Uzum ilovasi orqali to‘lov' },
                  { id: 'CASH_ON_DELIVERY', label: 'Qabul qilganda naqd', desc: 'Kuryer tovar topshirganda naqd to‘lash' },
                  { id: 'CARD_ON_DELIVERY', label: 'Qabul qilganda terminal', desc: 'Kuryer terminali orqali to‘lash' },
                ] as Array<{ id: PaymentMethod; label: string; desc: string }>
              ).map((pm) => {
                const isSelected = paymentMethod === pm.id;
                return (
                  <label
                    key={pm.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        value={pm.id}
                        checked={isSelected}
                        onChange={() => setPaymentMethod(pm.id)}
                        className="accent-primary"
                      />
                      <div>
                        <span className="text-xs font-bold text-foreground">{pm.label}</span>
                        <p className="text-[11px] text-muted-foreground">{pm.desc}</p>
                      </div>
                    </div>
                    <CreditCard className="size-4 text-muted-foreground" />
                  </label>
                );
              })}

              <div className="pt-2">
                <label className="text-xs font-semibold text-foreground">
                  Kuryer yoki buyurtma uchun qo‘shimcha eslatma (ixtiyoriy):
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Masalan: Iltimos, soat 14:00 dan keyin yetkazing..."
                  className="mt-1 w-full rounded-lg border bg-background p-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* O'ng ustun: Kupon, Tovar ko'rinishi va Hisob-kitob predprosmotri */}
        <div className="lg:col-span-5 space-y-6 sticky top-20">
          {/* Kupon / Promokod qo'llash */}
          <Card className="rounded-2xl border shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Tag className="size-4 text-primary" />
                <span>Promokod yoki kupon</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 text-xs">
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-600" />
                    <span className="font-mono font-bold">{appliedCoupon}</span>
                    <span>faollashtirildi</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCoupon}
                    className="h-7 text-xs text-destructive hover:bg-destructive/10"
                  >
                    O‘chirish
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Masalan: WELCOME10 yoki SUMMER50"
                    className="text-xs uppercase font-mono"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponInput.trim()}
                    className="text-xs shrink-0 cursor-pointer"
                  >
                    {isValidatingCoupon ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      'Qo‘llash'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Buyurtma xulosasi (Checkout Preview) */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Buyurtma tafsilotlari</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {preview?.total_items || itemCount} ta tovar
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* Tovar elementlari qisqartirilgan ro'yxati */}
              <div className="max-h-52 overflow-y-auto space-y-2.5 pr-1 divide-y divide-border/40">
                {preview?.items?.map((item) => (
                  <div key={item.item_id} className="pt-2 first:pt-0 flex items-center gap-3">
                    <div className="relative size-12 rounded-lg border bg-muted/40 shrink-0 overflow-hidden">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Sparkles className="size-4 opacity-40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-semibold text-foreground truncate">{item.product_name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.quantity} x {formatPrice(item.unit_price)}
                      </p>
                    </div>
                    <div className="text-xs font-bold text-foreground shrink-0">
                      {formatPrice(item.total_price)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Stock ogohlantirishlari */}
              {preview?.warnings && preview.warnings.length > 0 && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-400 space-y-1">
                  {preview.warnings.map((w, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Narx hisoboti */}
              <div className="space-y-2 pt-3 border-t text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Mahsulotlar narxi:</span>
                  <span className="font-semibold text-foreground">
                    {formatPrice(preview?.subtotal || cart?.subtotal || '0.00')}
                  </span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Yetkazib berish xarajati:</span>
                  <span className="font-semibold text-foreground">
                    {parseFloat(preview?.shipping_fee || '0') === 0
                      ? 'Bepul'
                      : formatPrice(preview?.shipping_fee || '0')}
                  </span>
                </div>

                {parseFloat(preview?.discount_amount || '0') > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Chegirma (Kupon):</span>
                    <span>-{formatPrice(preview?.discount_amount || '0')}</span>
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between items-baseline font-bold text-base text-foreground">
                  <div>
                    <span>Jami to‘lov miqdori:</span>
                    <p className="text-[10px] font-normal text-muted-foreground">QQS kiritilgan</p>
                  </div>
                  <span className="text-xl font-black text-primary">
                    {formatPrice(preview?.total_price || cart?.total_price || '0.00')}
                  </span>
                </div>
              </div>

              {/* Buyurtmani tasdiqlash tugmasi */}
              <Button
                type="submit"
                disabled={createOrderMutation.isPending || preview?.has_stock_issues}
                className="w-full h-12 text-sm font-bold gap-2 shadow-md cursor-pointer mt-4"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Buyurtma yaratilmoqda...</span>
                  </>
                ) : (
                  <>
                    <span>Buyurtmani tasdiqlash</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-1">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                <span>100% xavfsiz va kafolatlangan to‘lov</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
