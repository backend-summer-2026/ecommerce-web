import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderInvoiceClient } from './OrderInvoiceClient';

interface OrderInvoicePageProps {
  params: Promise<{ orderNumber: string }>;
}

export default function OrderInvoicePage({ params }: OrderInvoicePageProps) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl space-y-6">
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
      }
    >
      <OrderInvoiceContent params={params} />
    </Suspense>
  );
}

async function OrderInvoiceContent({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  return <OrderInvoiceClient orderNumber={orderNumber} />;
}
