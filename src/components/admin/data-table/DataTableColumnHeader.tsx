'use client';

import React from 'react';
import { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn('text-xs font-semibold text-muted-foreground', className)}>{title}</div>;
  }

  const isSorted = column.getIsSorted();

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(isSorted === 'asc')}
        className="-ml-3 h-8 data-[state=open]:bg-accent text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <span>{title}</span>
        {isSorted === 'desc' ? (
          <ArrowDown className="ml-1 size-3.5 text-primary" />
        ) : isSorted === 'asc' ? (
          <ArrowUp className="ml-1 size-3.5 text-primary" />
        ) : (
          <ChevronsUpDown className="ml-1 size-3.5 opacity-50" />
        )}
      </Button>
    </div>
  );
}
