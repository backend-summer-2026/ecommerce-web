import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderDetailClient } from './OrderDetailClient';

interface OrderDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 sm:px-6 py-8 space-y-6 max-w-5xl">
          <Skeleton className="h-6 w-48 rounded-md" />
          <Skeleton className="h-10 w-3/4 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      }
    >
      <OrderDetailContent params={params} />
    </Suspense>
  );
}

async function OrderDetailContent({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  return <OrderDetailClient orderNumber={orderNumber} />;
}
