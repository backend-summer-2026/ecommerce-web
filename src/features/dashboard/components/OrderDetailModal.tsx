'use client';

import React, { useState } from 'react';
import {
  X,
  Package,
  MapPin,
  CreditCard,
  Truck,
  User,
  Clock,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminOrderDetail } from '../hooks/useDashboard';
import { formatPrice, formatDate } from '@/lib/utils';
import { OrderStatusUpdateModal } from './OrderStatusUpdateModal';
import { OrderInternalNotesSection } from './OrderInternalNotesSection';
import Link from 'next/link';

interface OrderDetailModalProps {
  orderNumber: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailModal({ orderNumber, isOpen, onClose }: OrderDetailModalProps) {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const { data: order, isLoading } = useAdminOrderDetail(orderNumber || '');

  if (!isOpen || !orderNumber) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Yetkazildi</Badge>;
      case 'SHIPPED':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Yo'lda</Badge>;
      case 'PROCESSING':
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-200">Yig'ilmoqda</Badge>;
      case 'CONFIRMED':
        return <Badge className="bg-teal-500/10 text-teal-600 border-teal-200">Tasdiqlangan</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Bekor qilingan</Badge>;
      default:
        return <Badge variant="outline">Kutilmoqda</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">To'langan</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-200">Qaytarilgan</Badge>;
      case 'PARTIALLY_REFUNDED':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Qisman qaytarilgan</Badge>;
      default:
        return <Badge variant="outline">To'lanmagan</Badge>;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border bg-card p-6 shadow-xl animate-in fade-in-50 zoom-in-95">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>

          {/* Modal Sarlavhasi */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-mono text-foreground">
                  {orderNumber}
                </h2>
                {order && getStatusBadge(order.status)}
                {order && getPaymentStatusBadge(order.payment_status)}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Clock className="size-3" />
                <span>Yaratilgan: {order ? formatDate(order.created_at) : '...'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsStatusModalOpen(true)}
                className="gap-1.5 text-xs font-semibold"
              >
                <Edit className="size-3.5" />
                <span>Statusni yangilash</span>
              </Button>
              <Link href={`/orders/${orderNumber}`} target="_blank">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  <span>Mijoz ko'rinishi</span>
                  <ExternalLink className="size-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : !order ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Buyurtma ma'lumotlari topilmadi
            </div>
          ) : (
            <div className="mt-5 space-y-6">
              {/* 1. Mijoz va Yetkazib berish ma'lumotlari */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Mijoz kartasi */}
                <div className="p-4 rounded-lg border bg-muted/20 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-foreground text-sm border-b pb-2">
                    <User className="size-4 text-primary" />
                    <span>Mijoz Ma'lumotlari</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">
                      Ism: <span className="font-semibold text-foreground">{order.customer_name}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Email: <span className="font-semibold text-foreground">{order.user_email}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Telefon: <span className="font-semibold text-foreground">{order.user_phone || 'Mavjud emas'}</span>
                    </p>
                  </div>
                </div>

                {/* Manzil kartasi */}
                <div className="p-4 rounded-lg border bg-muted/20 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-foreground text-sm border-b pb-2">
                    <MapPin className="size-4 text-primary" />
                    <span>Yetkazib Berish Manzili</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">
                      {order.shipping_address?.recipient_name} ({order.shipping_address?.phone_number})
                    </p>
                    <p className="text-muted-foreground">
                      {order.shipping_address?.region}, {order.shipping_address?.district}
                    </p>
                    <p className="text-muted-foreground">
                      {order.shipping_address?.street_address}
                      {order.shipping_address?.apartment_office && `, ${order.shipping_address.apartment_office}`}
                    </p>
                    {order.shipping_address?.delivery_instructions && (
                      <p className="text-amber-600 font-medium mt-1">
                        Izoh: {order.shipping_address.delivery_instructions}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Mahsulotlar jadvali */}
              <div className="border rounded-lg overflow-hidden">
                <div className="p-3 bg-muted/40 font-semibold text-xs flex items-center gap-2 border-b">
                  <Package className="size-4 text-primary" />
                  <span>Buyurtma Tarkibi ({order.items.length} xil mahsulot)</span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/20 text-muted-foreground text-left">
                      <th className="py-2.5 px-4 font-medium">Mahsulot</th>
                      <th className="py-2.5 px-4 font-medium font-mono">SKU</th>
                      <th className="py-2.5 px-4 font-medium text-center">Narx</th>
                      <th className="py-2.5 px-4 font-medium text-center">Soni</th>
                      <th className="py-2.5 px-4 font-medium text-right">Jami</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {order.items.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/20">
                        <td className="py-2.5 px-4 font-semibold text-foreground">
                          {item.product_name}
                          {item.variant_attributes_display && (
                            <p className="text-[10px] text-muted-foreground font-normal">
                              {item.variant_attributes_display}
                            </p>
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-muted-foreground">
                          {item.variant_sku}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {formatPrice(Number(item.unit_price), { currency: 'UZS' })}
                        </td>
                        <td className="py-2.5 px-4 text-center font-bold">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-foreground">
                          {formatPrice(Number(item.total_price), { currency: 'UZS' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 3. Moliya va Tracking ma'lumotlari */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* To'lov va Yetkazib berish usuli */}
                <div className="p-4 rounded-lg border bg-muted/20 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-foreground text-sm border-b pb-2">
                    <CreditCard className="size-4 text-primary" />
                    <span>To'lov va Kuryerlik</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">To'lov usuli:</span>
                      <span className="font-semibold text-foreground">{order.payment_method || 'Noma\'lum'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Yetkazish usuli:</span>
                      <span className="font-semibold text-foreground">{order.shipping_method || 'Standart'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tracking Kodi:</span>
                      <span className="font-mono font-bold text-primary">
                        {order.tracking_number || 'Biriktirilmagan'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Moliyaviy hisob-kitob */}
                <div className="p-4 rounded-lg border bg-muted/20 space-y-1.5 text-xs">
                  <div className="font-semibold text-foreground text-sm border-b pb-2">
                    Hisob-kitob Xulosasi
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Mahsulotlar summasi:</span>
                    <span>{formatPrice(Number(order.subtotal || 0), { currency: 'UZS' })}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Yetkazib berish narxi:</span>
                    <span>{formatPrice(Number(order.shipping_fee || 0), { currency: 'UZS' })}</span>
                  </div>
                  {Number(order.discount_amount || 0) > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Kupon chegirmasi:</span>
                      <span>-{formatPrice(Number(order.discount_amount), { currency: 'UZS' })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-foreground border-t pt-2">
                    <span>Yakuniy To'lov:</span>
                    <span className="text-primary">
                      {formatPrice(Number(order.total_price || 0), { currency: 'UZS' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Ichki Eslatmalar */}
              <OrderInternalNotesSection orderNumber={orderNumber} />
            </div>
          )}
        </div>
      </div>

      {/* Status Yangilash Modali */}
      <OrderStatusUpdateModal
        orderNumber={orderNumber}
        currentStatus={order?.status}
        currentTracking={order?.tracking_number}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      />
    </>
  );
}
