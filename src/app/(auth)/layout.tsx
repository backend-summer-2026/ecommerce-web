import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-6 flex items-center gap-2 font-bold text-2xl text-primary">
        <Link href="/" className="flex items-center gap-2">
          <ShoppingBag className="size-7" />
          <span>ApexShop</span>
        </Link>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
