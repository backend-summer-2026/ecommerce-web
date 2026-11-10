'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './button';

interface AdminPaginationProps {
  page: number;
  totalCount: number;
  pageSize?: number;
  onPageChange: (newPage: number) => void;
  isLoading?: boolean;
}

export function AdminPagination({
  page,
  totalCount,
  pageSize = 15,
  onPageChange,
  isLoading = false,
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (totalCount <= pageSize) {
    return null;
  }

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  // Generate page numbers to show (e.g., current, +/- 1, first, last)
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('ellipsis');
      
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (page < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t bg-card text-xs text-muted-foreground select-none">
      <div>
        Jami <strong className="text-foreground font-semibold">{totalCount}</strong> tadan{' '}
        <strong className="text-foreground font-semibold">{startItem}</strong> -{' '}
        <strong className="text-foreground font-semibold">{endItem}</strong> ko'rsatilmoqda
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={page <= 1 || isLoading}
          className="size-8"
          title="Birinchi sahifa"
        >
          <ChevronsLeft className="size-3.5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isLoading}
          className="size-8"
          title="Oldingi sahifa"
        >
          <ChevronLeft className="size-3.5" />
        </Button>

        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) => {
            if (p === 'ellipsis') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground">
                  ...
                </span>
              );
            }
            const isCurrent = p === page;
            return (
              <Button
                key={p}
                variant={isCurrent ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(p)}
                disabled={isLoading}
                className={`size-8 p-0 text-xs font-semibold ${
                  isCurrent ? 'pointer-events-none shadow-xs' : ''
                }`}
              >
                {p}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isLoading}
          className="size-8"
          title="Keyingi sahifa"
        >
          <ChevronRight className="size-3.5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages || isLoading}
          className="size-8"
          title="Oxirgi sahifa"
        >
          <ChevronsRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
