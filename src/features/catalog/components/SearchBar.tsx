'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, X, Loader2, Sparkles, Tag, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchSuggestions } from '../hooks/useCatalog';
import { formatPrice, normalizeImageUrl } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  onSearchSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  className = '',
  onSearchSubmit,
  placeholder = 'Mahsulotlar, brendlar yoki toifalarni qidiring...',
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search term (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: suggestions, isLoading } = useSearchSuggestions(
    debouncedTerm,
    isOpen && debouncedTerm.length >= 2
  );

  // Tashqariga bosilganda dropdownni yopish
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsOpen(false);
    if (onSearchSubmit) onSearchSubmit();
    router.push(`/catalog?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleSelect = (url: string) => {
    setIsOpen(false);
    if (onSearchSubmit) onSearchSubmit();
    router.push(url);
  };

  const handleClear = () => {
    setSearchTerm('');
    setDebouncedTerm('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const hasSuggestions =
    suggestions &&
    (suggestions.products.length > 0 ||
      suggestions.categories.length > 0 ||
      suggestions.brands.length > 0);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSearch} className="relative flex items-center w-full">
        <Search className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (searchTerm.trim().length >= 2) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="h-10 pl-10 pr-16 bg-muted/50 border-input/60 focus-visible:bg-background rounded-full transition-all text-sm w-full"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="size-4 animate-spin text-muted-foreground mr-1" />
          )}

          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded-full text-muted-foreground hover:text-foreground"
              onClick={handleClear}
            >
              <X className="size-3.5" />
            </Button>
          )}

          <Button
            type="submit"
            size="icon"
            className="size-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            title="Qidirish"
          >
            <Search className="size-3.5" />
          </Button>
        </div>
      </form>

      {/* Autocomplete Dropdown Natijalari */}
      {isOpen && debouncedTerm.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border bg-popover/95 text-popover-foreground shadow-xl backdrop-blur-md overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Qidirilmoqda...</span>
            </div>
          ) : !hasSuggestions ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <Sparkles className="size-6 mx-auto mb-2 opacity-40" />
              <p>"{debouncedTerm}" bo'yicha hech qanday taklif topilmadi</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => handleSearch()}
                className="mt-2 text-primary"
              >
                Katalogda to'liq qidirish
              </Button>
            </div>
          ) : (
            <div className="max-h-[75vh] overflow-y-auto divide-y divide-border/60">
              {/* Kategoriyalar va Brendlar takliflari */}
              {(suggestions.categories.length > 0 || suggestions.brands.length > 0) && (
                <div className="p-3 bg-muted/20 space-y-2">
                  {suggestions.categories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1 mr-1">
                        <Layers className="size-3" />
                        Kategoriyalar:
                      </span>
                      {suggestions.categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelect(`/catalog?category=${cat.slug}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-background border hover:border-primary hover:text-primary transition-colors cursor-pointer"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {suggestions.brands.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1 mr-1">
                        <Tag className="size-3" />
                        Brendlar:
                      </span>
                      {suggestions.brands.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => handleSelect(`/catalog?brand=${b.slug}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-background border hover:border-primary hover:text-primary transition-colors cursor-pointer"
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Mahsulotlar Ro'yxati */}
              {suggestions.products.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Mahsulotlar
                  </div>
                  <div className="space-y-1">
                    {suggestions.products.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelect(`/products/${p.slug}`)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/80 text-left transition-colors cursor-pointer group"
                      >
                        <div className="relative size-12 rounded-md bg-muted overflow-hidden shrink-0 border">
                          {p.image ? (
                            <Image
                              src={normalizeImageUrl(p.image)}
                              alt={p.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <Sparkles className="size-4 opacity-40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {p.brand}
                          </p>
                          <h4 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                            {p.name}
                          </h4>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-foreground">
                            {formatPrice(p.price)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Barcha natijalarni ko'rish tugmasi */}
              <div className="p-2 bg-muted/40">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-xs font-medium text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => handleSearch()}
                >
                  "{debouncedTerm}" bo'yicha barcha natijalarni ko'rish &rarr;
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
