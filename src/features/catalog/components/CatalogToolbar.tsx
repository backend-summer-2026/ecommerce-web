'use client';

import React from 'react';
import { SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CatalogQueryParams } from '@/types/catalog';

interface CatalogToolbarProps {
  totalCount: number;
  currentParams: CatalogQueryParams;
  onFilterChange: (params: Partial<CatalogQueryParams>) => void;
  onOpenMobileFilters: () => void;
}

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Eng yangilari' },
  { value: 'price', label: 'Narx: arzondan qimmatga' },
  { value: '-price', label: 'Narx: qimmatdan arzonga' },
  { value: 'name', label: 'Nomi bo‘yicha (A-Z)' },
];

export function CatalogToolbar({
  totalCount,
  currentParams,
  onFilterChange,
  onOpenMobileFilters,
}: CatalogToolbarProps) {
  const currentOrdering = currentParams.ordering || '-created_at';

  // Faol filtrlarni aniqlash
  const activeChips: Array<{ key: string; label: string; onRemove: () => void }> = [];

  if (currentParams.q) {
    activeChips.push({
      key: 'q',
      label: `Qidiruv: "${currentParams.q}"`,
      onRemove: () => onFilterChange({ q: undefined, page: 1 }),
    });
  }

  if (currentParams.category) {
    activeChips.push({
      key: 'category',
      label: `Toifa: ${currentParams.category}`,
      onRemove: () => onFilterChange({ category: undefined, page: 1 }),
    });
  }

  if (currentParams.brand) {
    activeChips.push({
      key: 'brand',
      label: `Brend: ${currentParams.brand}`,
      onRemove: () => onFilterChange({ brand: undefined, page: 1 }),
    });
  }

  if (currentParams.min_price || currentParams.max_price) {
    const min = currentParams.min_price ? `$${currentParams.min_price}` : '$0';
    const max = currentParams.max_price ? `$${currentParams.max_price}` : '...';
    activeChips.push({
      key: 'price',
      label: `Narx: ${min} - ${max}`,
      onRemove: () => onFilterChange({ min_price: undefined, max_price: undefined, page: 1 }),
    });
  }

  if (currentParams.in_stock === 'true' || currentParams.in_stock === true) {
    activeChips.push({
      key: 'in_stock',
      label: 'Faqat sotuvda borlar',
      onRemove: () => onFilterChange({ in_stock: undefined, page: 1 }),
    });
  }

  // Dinamik atributlar (attr_*)
  Object.keys(currentParams).forEach((k) => {
    if (k.startsWith('attr_') && currentParams[k as `attr_${string}`]) {
      const attrName = k.replace('attr_', '');
      const attrVal = currentParams[k as `attr_${string}`];
      activeChips.push({
        key: k,
        label: `${attrName}: ${attrVal}`,
        onRemove: () => onFilterChange({ [k]: undefined, page: 1 }),
      });
    }
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 sm:p-4 rounded-xl border shadow-2xs">
        {/* Natijalar soni va Mobil Filtr tugmasi */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenMobileFilters}
            className="lg:hidden flex items-center gap-2"
          >
            <SlidersHorizontal className="size-4" />
            <span>Filtrlar</span>
            {activeChips.length > 0 && (
              <Badge variant="default" className="size-5 p-0 flex items-center justify-center text-[10px] rounded-full">
                {activeChips.length}
              </Badge>
            )}
          </Button>

          <span className="text-sm font-medium text-muted-foreground">
            <strong className="text-foreground font-semibold">{totalCount}</strong> ta mahsulot topildi
          </span>
        </div>

        {/* Saralash (Sort By) */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="size-4 text-muted-foreground hidden sm:inline" />
          <span className="text-xs text-muted-foreground hidden sm:inline">Saralash:</span>
          <select
            value={currentOrdering}
            onChange={(e) => onFilterChange({ ordering: e.target.value, page: 1 })}
            className="h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs sm:text-sm font-medium text-foreground shadow-2xs focus:border-primary focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Faol filtr teglari (Active Filter Chips) */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-muted-foreground mr-1">Faol filtrlar:</span>
          {activeChips.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="pl-2.5 pr-1.5 py-1 text-xs gap-1.5 bg-muted/80 hover:bg-muted font-normal"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="hover:text-destructive rounded-full p-0.5 hover:bg-background/80 transition-colors cursor-pointer"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
