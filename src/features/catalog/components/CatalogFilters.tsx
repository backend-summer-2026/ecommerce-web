'use client';

import React, { useState } from 'react';
import { Filter, X, RotateCcw, Check, Layers, Tag, DollarSign, PackageCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCatalogFilters, useCategories } from '../hooks/useCatalog';
import type { CatalogQueryParams } from '@/types/catalog';

interface CatalogFiltersProps {
  currentParams: CatalogQueryParams;
  onFilterChange: (params: Partial<CatalogQueryParams>) => void;
  onReset: () => void;
  className?: string;
  isMobileModal?: boolean;
  onCloseMobileModal?: () => void;
}

export function CatalogFilters({
  currentParams,
  onFilterChange,
  onReset,
  className = '',
  isMobileModal = false,
  onCloseMobileModal,
}: CatalogFiltersProps) {
  const { data: filtersData } = useCatalogFilters(currentParams.category);
  const { data: categories = [] } = useCategories();

  // Lokal min/max narx holati
  const [minPriceInput, setMinPriceInput] = useState(
    currentParams.min_price ? String(currentParams.min_price) : ''
  );
  const [maxPriceInput, setMaxPriceInput] = useState(
    currentParams.max_price ? String(currentParams.max_price) : ''
  );

  const handleApplyPrice = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onFilterChange({
      min_price: minPriceInput ? minPriceInput : undefined,
      max_price: maxPriceInput ? maxPriceInput : undefined,
      page: 1,
    });
  };

  const handleResetAll = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    onReset();
  };

  const handleBrandToggle = (brandSlug: string) => {
    const isSelected = currentParams.brand === brandSlug;
    onFilterChange({
      brand: isSelected ? undefined : brandSlug,
      page: 1,
    });
  };

  const handleCategorySelect = (categorySlug: string) => {
    const isSelected = currentParams.category === categorySlug;
    onFilterChange({
      category: isSelected ? undefined : categorySlug,
      page: 1,
    });
  };

  const handleInStockToggle = () => {
    const isCurrentlyInStock = currentParams.in_stock === 'true' || currentParams.in_stock === true;
    onFilterChange({
      in_stock: isCurrentlyInStock ? undefined : 'true',
      page: 1,
    });
  };

  const handleAttributeToggle = (attrSlug: string, valSlug: string) => {
    const key = `attr_${attrSlug}` as `attr_${string}`;
    const currentValue = currentParams[key];
    const isSelected = currentValue === valSlug;

    onFilterChange({
      [key]: isSelected ? undefined : valSlug,
      page: 1,
    });
  };

  const hasActiveFilters = Boolean(
    currentParams.category ||
      currentParams.brand ||
      currentParams.min_price ||
      currentParams.max_price ||
      currentParams.in_stock ||
      currentParams.q ||
      Object.keys(currentParams).some((k) => k.startsWith('attr_') && currentParams[k as `attr_${string}`])
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Sarlavha va Tozalash */}
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2 font-bold text-base">
          <Filter className="size-4 text-primary" />
          <span>Filtrlar</span>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetAll}
              className="h-8 text-xs text-muted-foreground hover:text-destructive px-2"
            >
              <RotateCcw className="size-3.5 mr-1" />
              Tozalash
            </Button>
          )}

          {isMobileModal && onCloseMobileModal && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseMobileModal}
              className="size-8 rounded-full"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Omborda mavjudligi (In Stock) */}
      <div className="space-y-2">
        <label className="flex items-center gap-2.5 cursor-pointer select-none text-sm font-medium">
          <input
            type="checkbox"
            checked={currentParams.in_stock === 'true' || currentParams.in_stock === true}
            onChange={handleInStockToggle}
            className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary"
          />
          <PackageCheck className="size-4 text-muted-foreground" />
          <span>Faqat sotuvda borlar</span>
        </label>
      </div>

      {/* Kategoriyalar filtri */}
      <div className="space-y-3 pt-3 border-t">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Layers className="size-3.5" />
            Kategoriyalar
          </span>
          {currentParams.category && (
            <button
              onClick={() => handleCategorySelect(currentParams.category!)}
              className="text-[11px] text-primary hover:underline lowercase"
            >
              hammasi
            </button>
          )}
        </div>

        <div className="max-h-48 overflow-y-auto space-y-1 pr-1 text-sm">
          {categories.map((cat) => {
            const isSelected = currentParams.category === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.slug)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-sm transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {isSelected && <Check className="size-3.5 shrink-0 ml-1 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Narx oralig'i (Dual Range / Min-Max Input) */}
      <div className="space-y-3 pt-3 border-t">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <DollarSign className="size-3.5" />
            Narx ($)
          </span>
          {filtersData?.price_range && (
            <span className="text-[11px] text-muted-foreground">
              ${Math.floor(Number(filtersData.price_range.min))} - ${Math.ceil(Number(filtersData.price_range.max))}
            </span>
          )}
        </div>

        <form onSubmit={handleApplyPrice} className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder={filtersData?.price_range?.min ? String(Math.floor(Number(filtersData.price_range.min))) : 'Min'}
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder={filtersData?.price_range?.max ? String(Math.ceil(Number(filtersData.price_range.max))) : 'Max'}
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <Button type="submit" variant="secondary" size="sm" className="w-full h-8 text-xs font-medium">
            Narxni qo'llash
          </Button>
        </form>
      </div>

      {/* Brendlar (Brands) */}
      {filtersData?.brands && filtersData.brands.length > 0 && (
        <div className="space-y-3 pt-3 border-t">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Tag className="size-3.5" />
              Brendlar
            </span>
            {currentParams.brand && (
              <button
                onClick={() => handleBrandToggle(currentParams.brand!)}
                className="text-[11px] text-primary hover:underline lowercase"
              >
                barchasi
              </button>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {filtersData.brands.map((b) => {
              const isSelected = currentParams.brand === b.slug;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleBrandToggle(b.slug)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-sm transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <span className="truncate">{b.name}</span>
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    <span className="text-[11px] text-muted-foreground">({b.product_count})</span>
                    {isSelected && <Check className="size-3.5 text-primary ml-1" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dinamik Xususiyatlar (Dynamic Attributes: Masalan Color, Storage, RAM) */}
      {filtersData?.attributes &&
        filtersData.attributes.map((attr) => {
          const key = `attr_${attr.slug}` as `attr_${string}`;
          const currentAttrVal = currentParams[key];

          return (
            <div key={attr.id} className="space-y-3 pt-3 border-t">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>{attr.name}</span>
                {currentAttrVal && (
                  <button
                    onClick={() => onFilterChange({ [key]: undefined, page: 1 })}
                    className="text-[11px] text-primary hover:underline lowercase"
                  >
                    tozalash
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {attr.values.map((v) => {
                  const isSelected = currentAttrVal === v.slug;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleAttributeToggle(attr.slug, v.slug)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-background hover:bg-muted/80 text-foreground border-input/60'
                      }`}
                    >
                      <span>{v.value}</span>
                      <span className={`text-[10px] ${isSelected ? 'opacity-80' : 'text-muted-foreground'}`}>
                        ({v.count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

      {isMobileModal && (
        <div className="pt-4 border-t">
          <Button
            className="w-full"
            onClick={onCloseMobileModal}
          >
            Natijalarni ko'rish
          </Button>
        </div>
      )}
    </div>
  );
}
