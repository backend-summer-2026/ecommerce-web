'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-lg text-primary">
              <ShoppingBag className="size-5" />
              <span>ApexShop</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Zamonaviy texnologiyalar va sifatli mahsulotlar internet do'koni. O'zbekiston bo'ylab tezkor yetkazib berish.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Katalog</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/catalog?category=smartphones" className="hover:text-foreground">Smartfonlar</Link></li>
              <li><Link href="/catalog?category=laptops" className="hover:text-foreground">Noutbuklar</Link></li>
              <li><Link href="/catalog?category=accessories" className="hover:text-foreground">Aksessuarlar</Link></li>
              <li><Link href="/catalog" className="hover:text-foreground">Barcha tovarlar</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Xaridorlar uchun</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/orders" className="hover:text-foreground">Buyurtmani kuzatish</Link></li>
              <li><Link href="/cart" className="hover:text-foreground">Savatcha</Link></li>
              <li><Link href="/faq" className="hover:text-foreground">Ko'p beriladigan savollar</Link></li>
              <li><Link href="/delivery" className="hover:text-foreground">Yetkazib berish shartlari</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Bog'lanish</h4>
            <p className="text-sm text-muted-foreground">
              Toshkent sh., O'zbekiston<br />
              Aloqa: +998 71 200-00-00<br />
              Email: support@apexshop.uz
            </p>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          © 2026 ApexShop. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
}
