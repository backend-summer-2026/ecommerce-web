'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories } from '@/features/catalog/hooks/useCatalog';

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Sarlavha */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Barcha Mahsulot Toifalari
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kategoriyalar daraxti bo'yicha kerakli tovarlarni qulay toping
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border bg-muted/20">
          <Layers className="size-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Toifalar topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col rounded-2xl border bg-card p-6 shadow-2xs hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              {/* Asosiy Kategoriya Sarlavhasi */}
              <div className="flex items-center justify-between pb-4 border-b">
                <Link
                  href={`/catalog?category=${cat.slug}`}
                  className="font-bold text-lg text-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Layers className="size-5" />
                  </div>
                  <span>{cat.name}</span>
                </Link>

                <Link
                  href={`/catalog?category=${cat.slug}`}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Barchasi
                </Link>
              </div>

              {/* Sub-kategoriyalar */}
              <div className="flex-1 py-4 space-y-3">
                {cat.children && cat.children.length > 0 ? (
                  <div className="space-y-3">
                    {cat.children.map((sub) => (
                      <div key={sub.id} className="space-y-1">
                        <Link
                          href={`/catalog?category=${sub.slug}`}
                          className="font-semibold text-sm text-foreground hover:text-primary transition-colors flex items-center justify-between group"
                        >
                          <span>{sub.name}</span>
                          <ChevronRight className="size-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
                        </Link>

                        {/* Chuqur 3-daraja */}
                        {sub.children && sub.children.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pl-2 pt-1">
                            {sub.children.map((leaf) => (
                              <Link
                                key={leaf.id}
                                href={`/catalog?category=${leaf.slug}`}
                                className="inline-block px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {leaf.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Ushbu bo'limda qo'shimcha kichik toifalar yo'q
                  </p>
                )}
              </div>

              {/* Pastki Harakat Tugmasi */}
              <div className="pt-3 border-t">
                <Link href={`/catalog?category=${cat.slug}`}>
                  <Button variant="ghost" size="sm" className="w-full justify-between text-xs font-semibold text-primary">
                    <span>"{cat.name}" bo'yicha xarid qilish</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
