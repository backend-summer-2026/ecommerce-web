'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartEmptyStateProps {
  onActionClick?: () => void;
}

export function CartEmptyState({ onActionClick }: CartEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
      <div className="size-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <ShoppingBag className="size-10 stroke-[1.5]" />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-lg font-bold tracking-tight">Savatchangiz bo'sh</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Hozircha savatchangizga hech qanday mahsulot qo'shilmagan. Katalogimizdan o'zingizga yoqqan tovarlarni tanlang!
        </p>
      </div>

      <Link href="/catalog" onClick={onActionClick}>
        <Button className="gap-2 font-medium">
          <span>Xaridni boshlash</span>
          <ArrowRight className="size-4" />
        </Button>
      </Link>
    </div>
  );
}
