'use client';

import React, { useState } from 'react';
import { Table } from '@tanstack/react-table';
import {
  Download,
  SlidersHorizontal,
  X,
  Search,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { exportToCsv } from '@/lib/exportUtils';
import { toast } from 'sonner';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  searchPlaceholder?: string;
  exportFilename?: string;
  onBulkAction?: (selectedRows: TData[], action: string) => void;
  bulkActionLabel?: string;
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = 'Qidirish...',
  exportFilename = 'export_data',
  onBulkAction,
  bulkActionLabel = 'Ommaviy amal',
}: DataTableToolbarProps<TData>) {
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const isFiltered = table.getState().columnFilters.length > 0 || Boolean(table.getState().globalFilter);

  const selectedRows = table.getFilteredSelectedRowModel().rows.map((r) => r.original);
  const selectedCount = selectedRows.length;

  const handleExportSelected = () => {
    if (selectedRows.length === 0) {
      toast.error('Avval qatorlarni belgilang');
      return;
    }
    exportToCsv(selectedRows as Record<string, any>[], `${exportFilename}_selected`);
    toast.success(`${selectedRows.length} ta yozuv CSV formatida yuklab olindi`);
  };

  const handleExportAll = () => {
    const allRows = table.getFilteredRowModel().rows.map((r) => r.original);
    if (allRows.length === 0) {
      toast.error("Eksport qilish uchun ma'lumot yo'q");
      return;
    }
    exportToCsv(allRows as Record<string, any>[], exportFilename);
    toast.success(`Barcha (${allRows.length} ta) yozuvlar CSV formatida yuklab olindi`);
  };

  return (
    <div className="flex flex-col gap-3 p-3 border-b bg-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Qidiruv */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={
                searchKey
                  ? (table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
                  : (table.getState().globalFilter as string) ?? ''
              }
              onChange={(event) => {
                if (searchKey) {
                  table.getColumn(searchKey)?.setFilterValue(event.target.value);
                } else {
                  table.setGlobalFilter(event.target.value);
                }
              }}
              className="h-9 pl-8 text-xs bg-background"
            />
          </div>

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                table.resetColumnFilters();
                table.setGlobalFilter('');
              }}
              className="h-9 px-2 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground"
            >
              <span>Tozalash</span>
              <X className="size-3.5" />
            </Button>
          )}
        </div>

        {/* O'ng tomon amallari: Ustunlar & Eksport */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Ustunlarni yashirish / ko'rsatish */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColumnToggle((prev) => !prev)}
              className="h-9 gap-1.5 text-xs font-semibold"
            >
              <SlidersHorizontal className="size-3.5" />
              <span>Ustunlar</span>
            </Button>

            {showColumnToggle && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowColumnToggle(false)}
                />
                <div className="absolute right-0 top-11 z-50 w-48 rounded-xl border bg-card p-2 shadow-xl animate-in fade-in-50 zoom-in-95">
                  <div className="px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b mb-1">
                    Ustunlarni ko'rsatish
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {table
                      .getAllColumns()
                      .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
                      .map((column) => {
                        return (
                          <button
                            key={column.id}
                            type="button"
                            onClick={() => column.toggleVisibility(!column.getIsVisible())}
                            className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-muted text-foreground cursor-pointer"
                          >
                            <span className="capitalize">{column.id.replace(/_/g, ' ')}</span>
                            {column.getIsVisible() && <Check className="size-3.5 text-primary" />}
                          </button>
                        );
                      })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Eksport CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAll}
            className="h-9 gap-1.5 text-xs font-semibold"
            title="Barcha filtrlangan yozuvlarni CSV ga yuklab olish"
          >
            <Download className="size-3.5" />
            <span>CSV Eksport</span>
          </Button>
        </div>
      </div>

      {/* Tanlangan qatorlar bo'yicha tezkor amallar paneli (Bulk Actions Bar) */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between p-2.5 px-3 rounded-lg bg-primary/10 border border-primary/20 text-xs animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">
              {selectedCount} ta element tanlandi
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSelected}
              className="h-7 text-xs font-semibold gap-1.5 bg-background shadow-2xs"
            >
              <FileSpreadsheet className="size-3.5 text-emerald-600" />
              <span>Tanlanganlarni CSV ga yuklash</span>
            </Button>

            {onBulkAction && (
              <Button
                size="sm"
                onClick={() => onBulkAction(selectedRows, 'CUSTOM')}
                className="h-7 text-xs font-semibold"
              >
                {bulkActionLabel}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.resetRowSelection()}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              Bekor qilish
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
