'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderInternalNote } from '@/types';
import { formatDate } from '@/lib/utils';
import { useOrderNotes, useAddOrderNote } from '../hooks/useDashboard';
import { MessageSquare, Pin, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface OrderInternalNotesSectionProps {
  orderNumber: string;
}

export function OrderInternalNotesSection({ orderNumber }: OrderInternalNotesSectionProps) {
  const [noteText, setNoteText] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const { data: notes = [], isLoading } = useOrderNotes(orderNumber);
  const addNoteMutation = useAddOrderNote();

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) {
      toast.error('Eslatma matnini kiriting');
      return;
    }

    try {
      await addNoteMutation.mutateAsync({
        orderNumber,
        payload: {
          note: noteText.trim(),
          is_pinned: isPinned,
        },
      });
      setNoteText('');
      setIsPinned(false);
    } catch {
      // Handled by mutation
    }
  };

  return (
    <Card className="border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <MessageSquare className="size-4 text-primary" />
            <span>Ichki Eslatmalar (Internal Operator Notes)</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {notes.length} ta eslatma
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Faqat adminlar va operatorlar uchun (mijozga ko'rinmaydi)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ro'yxat */}
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : notes.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground border rounded-lg border-dashed">
            Hozircha ichki eslatmalar kiritilmagan.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {notes.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-lg border text-xs space-y-1 transition-colors ${
                  n.is_pinned ? 'bg-amber-500/10 border-amber-200' : 'bg-muted/40 border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    {n.is_pinned && <Pin className="size-3 text-amber-600 fill-amber-600" />}
                    <span>{n.author_email || 'Operator'}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(n.created_at)}
                  </span>
                </div>
                <p className="text-foreground whitespace-pre-wrap">{n.note}</p>
              </div>
            ))}
          </div>
        )}

        {/* Eslatma qo'shish formasi */}
        <form onSubmit={handleAddNote} className="space-y-2 border-t pt-3">
          <textarea
            rows={2}
            placeholder="Yangi ichki eslatma yozing..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="w-full rounded-md border border-input bg-background p-2.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="size-3.5 rounded border-input"
              />
              <span className="text-muted-foreground">Yuqoriga mahkamlash (Pin)</span>
            </label>
            <Button
              type="submit"
              size="sm"
              disabled={addNoteMutation.isPending || !noteText.trim()}
              className="gap-1.5 text-xs h-7"
            >
              {addNoteMutation.isPending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Send className="size-3" />
              )}
              <span>Qo'shish</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
