'use client';

import React from 'react';
import Link from 'next/link';
import { Printer, ArrowLeft, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  PAYMENT_METHOD_MAP,
  PAYMENT_STATUS_MAP,
  SHIPPING_METHOD_MAP,
} from '@/features/orders/utils/statusUtils';
import type { OrderInvoice } from '@/types/orders';

interface OrderInvoiceViewProps {
  invoice: OrderInvoice;
}

export function OrderInvoiceView({ invoice }: OrderInvoiceViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const paymentStatusCfg = PAYMENT_STATUS_MAP[invoice.payment_status] || {
    label: invoice.payment_status,
    color: 'text-foreground',
    bg: 'bg-muted',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Harakatlar paneli (Chop etishda ko'rinmaydi) */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/orders/${invoice.order_number}`}>
          <Button variant="ghost" size="sm" className="gap-2 cursor-pointer">
            <ArrowLeft className="size-4" />
            <span>Buyurtmaga qaytish</span>
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2 cursor-pointer"
          >
            <Printer className="size-4" />
            <span>Chop etish</span>
          </Button>
        </div>
      </div>

      {/* Invoys qog'ozi (Chop etish uchun moslangan) */}
      <div className="rounded-2xl border bg-card text-card-foreground p-8 sm:p-12 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Yuqori qism: Do'kon rekvizitlari va Invoys raqami */}
        <div className="flex flex-wrap items-start justify-between gap-6 border-b pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-black text-2xl tracking-tight text-primary">
              <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                <ShoppingBag className="size-5" />
              </div>
              <span>ApexShop</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              «ApexShop Online Retail» MCHJ
              <br />
              O‘zbekiston, Toshkent sh., Amir Temur shoh ko‘chasi, 107
              <br />
              STIR: 308992144 | Tel: +998 (71) 200-00-00
            </p>
          </div>

          <div className="text-right space-y-1.5">
            <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider px-3 py-1">
              Elektron Hisob-faktura
            </Badge>
            <div className="text-lg font-black font-mono tracking-tight text-foreground">
              #{invoice.order_number}
            </div>
            <div className="text-xs text-muted-foreground">
              Sana: {formatDate(invoice.created_at)}
            </div>
            {invoice.paid_at && (
              <div className="text-xs text-muted-foreground">
                To‘langan: {formatDate(invoice.paid_at)}
              </div>
            )}
            <div className="pt-1">
              <Badge
                variant="outline"
                className={`text-[11px] font-semibold ${paymentStatusCfg.bg} ${paymentStatusCfg.color}`}
              >
                {paymentStatusCfg.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Mijoz va Yetkazib berish ma'lumotlari */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-foreground uppercase tracking-wider text-[11px]">
              Xaridor (Buyurtmachi):
            </h4>
            <div className="space-y-1 text-muted-foreground">
              <p className="font-semibold text-foreground text-sm">
                {invoice.shipping_address?.recipient_name || invoice.customer_name || 'Xaridor'}
              </p>
              <p>Telefon: {invoice.shipping_address?.phone_number || invoice.customer_phone}</p>
              {invoice.customer_email && <p>Email: {invoice.customer_email}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-sm text-foreground uppercase tracking-wider text-[11px]">
              Yetkazib berish manzili:
            </h4>
            <div className="space-y-1 text-muted-foreground">
              <p className="font-medium text-foreground">
                {invoice.shipping_address?.full_address ||
                  `${invoice.shipping_address?.region || ''}, ${
                    invoice.shipping_address?.district || ''
                  }, ${invoice.shipping_address?.street_address || ''}`}
              </p>
              <p>
                Yetkazib berish usuli:{' '}
                <span className="font-medium text-foreground">
                  {SHIPPING_METHOD_MAP[invoice.shipping_method]?.label || invoice.shipping_method}
                </span>
              </p>
              <p>
                To‘lov usuli:{' '}
                <span className="font-medium text-foreground">
                  {PAYMENT_METHOD_MAP[invoice.payment_method] || invoice.payment_method}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Tovar elementlari jadvali */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground">
                <th className="py-2.5 px-3 font-semibold w-10">#</th>
                <th className="py-2.5 px-3 font-semibold">Mahsulot tavsifi</th>
                <th className="py-2.5 px-3 font-semibold w-24">SKU</th>
                <th className="py-2.5 px-3 font-semibold text-right w-24">Dona narxi</th>
                <th className="py-2.5 px-3 font-semibold text-center w-16">Soni</th>
                <th className="py-2.5 px-3 font-semibold text-right w-28">Jami</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoice.items.map((item, index) => (
                <tr key={item.id} className="hover:bg-muted/20">
                  <td className="py-3 px-3 text-muted-foreground">{index + 1}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-foreground">{item.product_name}</div>
                    {item.variant_attributes_display && (
                      <div className="text-[11px] text-muted-foreground">
                        {item.variant_attributes_display}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground">
                    {item.variant_sku}
                  </td>
                  <td className="py-3 px-3 text-right">{formatPrice(item.unit_price)}</td>
                  <td className="py-3 px-3 text-center font-semibold">{item.quantity}</td>
                  <td className="py-3 px-3 text-right font-bold text-foreground">
                    {formatPrice(item.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Jami hisob-kitoblar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pt-4 border-t">
          <div className="space-y-1 text-xs text-muted-foreground max-w-sm">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>To‘lov kafolatlangan va tasdiqlangan</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Mazkur elektron invoys O‘zbekiston Respublikasining elektron tijorat to‘g‘risidagi
              qonunchiligi talablariga muvofiq rasmiylashtirilgan.
            </p>
          </div>

          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Mahsulotlar jami:</span>
              <span className="font-medium text-foreground">{formatPrice(invoice.subtotal)}</span>
            </div>

            {parseFloat(invoice.discount_amount || '0') > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Chegirma:</span>
                <span>-{formatPrice(invoice.discount_amount)}</span>
              </div>
            )}

            <div className="flex justify-between text-muted-foreground">
              <span>Yetkazib berish xarajati:</span>
              <span className="font-medium text-foreground">
                {parseFloat(invoice.shipping_fee || '0') === 0
                  ? 'Bepul'
                  : formatPrice(invoice.shipping_fee)}
              </span>
            </div>

            <div className="border-t pt-2 flex justify-between items-baseline font-bold text-base text-foreground">
              <span>Yakuniy to‘lov:</span>
              <span className="text-primary font-black text-lg">
                {formatPrice(invoice.total_price)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
