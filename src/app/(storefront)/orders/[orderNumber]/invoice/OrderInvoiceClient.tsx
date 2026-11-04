'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrderInvoice } from '@/features/orders/hooks/useOrders';
import { OrderInvoiceView } from '@/features/orders/components/OrderInvoiceView';

interface OrderInvoiceClientProps {
  orderNumber: string;
}

export function OrderInvoiceClient({ orderNumber }: OrderInvoiceClientProps) {
  const { data: invoice, isLoading, error } = useOrderInvoice(orderNumber);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl space-y-6">
        <Skeleton className="h-9 w-36 rounded-lg" />
        <Skeleton className="h-[600px] w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-16 text-center space-y-4 max-w-md">
        <div className="size-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertTriangle className="size-8" />
        </div>
        <h2 className="text-xl font-bold">Invoys topilmadi</h2>
        <p className="text-xs text-muted-foreground">
          Buyurtma hisob-fakturasini yuklashda xatolik yuz berdi.
        </p>
        <Link href={`/orders/${orderNumber}`}>
          <Button size="sm" variant="outline" className="gap-2">
            <ArrowLeft className="size-4" />
            <span>Buyurtmaga qaytish</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <OrderInvoiceView invoice={invoice} />
    </div>
  );
}
