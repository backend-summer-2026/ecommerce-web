import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductDetailClient } from './ProductDetailClient';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
          <Skeleton className="h-6 w-1/3 rounded-md" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 rounded-md" />
              <Skeleton className="h-6 w-1/4 rounded-md" />
              <Skeleton className="h-10 w-1/2 rounded-md" />
            </div>
          </div>
        </div>
      }
    >
      <ProductPageContent params={params} />
    </Suspense>
  );
}

async function ProductPageContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
