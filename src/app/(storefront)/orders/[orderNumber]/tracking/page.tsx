import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderTrackingClient } from './OrderTrackingClient';

interface OrderTrackingPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl space-y-6">
          <Skeleton className="h-9 w-40 rounded-lg" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      }
    >
      <OrderTrackingContent params={params} />
    </Suspense>
  );
}

async function OrderTrackingContent({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  return <OrderTrackingClient orderNumber={orderNumber} />;
}
