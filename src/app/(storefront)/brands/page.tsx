'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Tag, ExternalLink, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useBrands } from '@/features/catalog/hooks/useCatalog';

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: brands = [], isLoading } = useBrands();

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Sarlavha va Qidiruv */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Rasmiy Hamkor Brendlar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dunyoning yetakchi ishlab chiqaruvchilarining 100% original tovarlari
          </p>
        </div>

        <div className="w-full md:w-72">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Brend nomini qidiring..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border space-y-4">
              <Skeleton className="size-12 rounded-xl" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border bg-muted/20">
          <Tag className="size-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Hech qanday brend topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBrands.map((brand) => (
            <div
              key={brand.id}
              className="flex flex-col rounded-2xl border bg-card p-6 shadow-2xs hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {brand.name[0]}
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  {brand.products_count} ta tovar
                </span>
              </div>

              <h3 className="font-bold text-lg text-foreground mb-1">
                {brand.name}
              </h3>

              {brand.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                  {brand.description}
                </p>
              )}

              <div className="mt-auto pt-4 border-t flex flex-col gap-2">
                <Link href={`/catalog?brand=${brand.slug}`}>
                  <Button variant="default" size="sm" className="w-full justify-between text-xs font-semibold">
                    <span>Mahsulotlarni ko'rish</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>

                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground py-1 transition-colors"
                  >
                    <span>Rasmiy sayti</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
