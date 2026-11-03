'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Grid, ChevronRight, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCategories } from '../hooks/useCatalog';

export function CategoryMegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: categories = [], isLoading } = useCategories();

  const activeCategory =
    categories.find((c) => c.id === selectedCategoryId) || categories[0] || null;

  // Tashqariga bosilganda menyuni yopish
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant={isOpen ? 'default' : 'outline'}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 font-medium"
      >
        <Grid className="size-4" />
        <span>Kategoriyalar</span>
        <ChevronDown
          className={`size-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-[720px] max-w-[90vw] rounded-2xl border bg-popover text-popover-foreground shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150 overflow-hidden">
          {isLoading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Kategoriyalar yuklanmoqda...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Kategoriyalar topilmadi
            </div>
          ) : (
            <div className="grid grid-cols-12 min-h-[380px]">
              {/* Asosiy ildiz kategoriyalar ustuni */}
              <div className="col-span-5 border-r bg-muted/30 p-2 space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Barcha bo'limlar
                </div>
                {categories.map((cat) => {
                  const isSelected = activeCategory?.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onMouseEnter={() => setSelectedCategoryId(cat.id)}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-foreground hover:bg-muted/80'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <ChevronRight
                        className={`size-4 opacity-70 ${isSelected ? 'text-primary-foreground' : ''}`}
                      />
                    </button>
                  );
                })}

                <div className="pt-2 mt-2 border-t px-2">
                  <Link
                    href="/categories"
                    onClick={() => setIsOpen(false)}
                    className="block text-center text-xs font-medium text-primary hover:underline py-1.5"
                  >
                    Barcha kategoriyalar xaritasi &rarr;
                  </Link>
                </div>
              </div>

              {/* Ichki sub-kategoriyalar paneli */}
              <div className="col-span-7 p-6 overflow-y-auto max-h-[440px]">
                {activeCategory ? (
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b mb-4">
                      <Link
                        href={`/catalog?category=${activeCategory.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="font-bold text-base hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <Layers className="size-4 text-primary" />
                        <span>{activeCategory.name}</span>
                      </Link>
                      <Link
                        href={`/catalog?category=${activeCategory.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        Barchasini ko'rish &rarr;
                      </Link>
                    </div>

                    {activeCategory.children && activeCategory.children.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {activeCategory.children.map((sub) => (
                          <div key={sub.id} className="space-y-1.5">
                            <Link
                              href={`/catalog?category=${sub.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="font-semibold text-sm hover:text-primary transition-colors block"
                            >
                              {sub.name}
                            </Link>

                            {/* Uchinchi darajali bolalar */}
                            {sub.children && sub.children.length > 0 && (
                              <div className="flex flex-col gap-1 pl-1 text-xs text-muted-foreground">
                                {sub.children.map((leaf) => (
                                  <Link
                                    key={leaf.id}
                                    href={`/catalog?category=${leaf.slug}`}
                                    onClick={() => setIsOpen(false)}
                                    className="hover:text-foreground hover:underline transition-colors py-0.5 truncate"
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
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        <p>Ushbu toifada qo'shimcha kichik bo'limlar yo'q.</p>
                        <Link
                          href={`/catalog?category=${activeCategory.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="mt-3 inline-block font-medium text-primary hover:underline"
                        >
                          Ushbu toifadagi mahsulotlarni ko'rish &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Toifani tanlang
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
