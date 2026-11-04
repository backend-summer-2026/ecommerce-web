'use client';

import React from 'react';
import {
  CheckCircle2,
  Trash2,
  Star,
  ShieldCheck,
  Clock,
  Wifi,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { SavedCard } from '@/types/payments';
import {
  detectCardBrand,
  getCardBrandTheme,
  maskCardNumber,
} from '@/features/payments/utils/cardUtils';

interface CreditCardDisplayProps {
  card: SavedCard;
  onSetDefault?: (cardId: number) => void;
  onDelete?: (cardId: number) => void;
  onVerify?: (card: SavedCard) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (card: SavedCard) => void;
  isSettingDefault?: boolean;
  isDeleting?: boolean;
}

export function CreditCardDisplay({
  card,
  onSetDefault,
  onDelete,
  onVerify,
  selectable = false,
  selected = false,
  onSelect,
  isSettingDefault = false,
  isDeleting = false,
}: CreditCardDisplayProps) {
  const brand = card.brand || detectCardBrand(card.card_number);
  const theme = getCardBrandTheme(brand);

  const formattedExpiry =
    card.expire_month && card.expire_year
      ? `${String(card.expire_month).padStart(2, '0')}/${String(card.expire_year).slice(-2)}`
      : '••/••';

  return (
    <div
      onClick={() => selectable && onSelect && onSelect(card)}
      className={`group relative overflow-hidden rounded-2xl border p-5 shadow-lg transition-all duration-300 ${theme.bg} ${theme.border} ${
        selectable
          ? 'cursor-pointer hover:scale-[1.02] hover:shadow-xl'
          : 'hover:shadow-xl'
      } ${selected ? 'ring-4 ring-primary ring-offset-2' : ''}`}
    >
      {/* Fon nurlanish effekti */}
      <div className="absolute -right-12 -top-12 size-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 size-40 rounded-full bg-black/20 blur-2xl pointer-events-none" />

      {/* Yuqori qator: Chip va Brand & Default badge */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          {/* EMV Chip simulyatsiyasi */}
          <div className="h-7 w-9 rounded-md bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 shadow-inner border border-amber-300/60 flex items-center justify-center">
            <div className="w-5 h-4 border border-amber-800/40 rounded-xs opacity-60" />
          </div>
          {/* Contactless Wifi belgisi */}
          <Wifi className="size-4.5 text-white/70 rotate-90" />
        </div>

        <div className="flex items-center gap-2">
          {card.is_default && (
            <Badge
              variant="outline"
              className="bg-emerald-500/20 text-emerald-200 border-emerald-400/40 text-[10px] font-semibold gap-1"
            >
              <CheckCircle2 className="size-3" />
              <span>Asosiy</span>
            </Badge>
          )}

          {!card.is_verified && (
            <Badge
              variant="outline"
              className="bg-amber-500/20 text-amber-200 border-amber-400/40 text-[10px] font-semibold gap-1"
            >
              <Clock className="size-3" />
              <span>Tasdiqlanmagan</span>
            </Badge>
          )}

          <span className="text-xs font-black tracking-widest uppercase px-2.5 py-1 rounded-md bg-black/25 backdrop-blur-xs text-white/90 border border-white/10">
            {theme.brandName}
          </span>
        </div>
      </div>

      {/* Karta raqami */}
      <div className="mt-6 mb-4 relative z-10">
        <p className="font-mono text-lg sm:text-xl tracking-[0.2em] font-semibold text-white drop-shadow-sm">
          {maskCardNumber(card.card_number)}
        </p>
      </div>

      {/* Pastki qism: Karta egasi va Amal qilish muddati */}
      <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/15">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-white/70 block">
            Karta egasi
          </span>
          <span className="text-xs font-semibold text-white uppercase tracking-wider line-clamp-1 max-w-[170px]">
            {card.card_holder || 'KARTA EGASI'}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[9px] uppercase tracking-wider text-white/70 block">
            Muddati
          </span>
          <span className="text-xs font-mono font-semibold text-white tracking-wider">
            {formattedExpiry}
          </span>
        </div>

        <div>
          <span className="text-[9px] uppercase tracking-wider text-white/70 block text-right">
            Shlyuz
          </span>
          <span className="text-[11px] font-bold text-white/90 tracking-wide block text-right">
            {card.provider}
          </span>
        </div>
      </div>

      {/* Amallar paneli (faqat selectable bo'lmaganda yoki qo'shimcha amallar uchun) */}
      {(onSetDefault || onDelete || (!card.is_verified && onVerify)) && !selectable && (
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2 relative z-10">
          {!card.is_verified && onVerify ? (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onVerify(card);
              }}
              className="bg-amber-500/20 text-white hover:bg-amber-500/30 border-amber-400/40 text-xs h-8 gap-1.5"
            >
              <ShieldCheck className="size-3.5" />
              <span>SMS kodni kiritish</span>
            </Button>
          ) : (
            !card.is_default && onSetDefault && (
              <Button
                size="sm"
                variant="ghost"
                disabled={isSettingDefault}
                onClick={(e) => {
                  e.stopPropagation();
                  onSetDefault(card.id);
                }}
                className="text-white/80 hover:text-white hover:bg-white/10 text-xs h-8 gap-1.5 px-2"
              >
                <Star className="size-3.5" />
                <span>Asosiy qilish</span>
              </Button>
            )
          )}

          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              disabled={isDeleting}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card.id);
              }}
              className="text-red-300 hover:text-red-100 hover:bg-red-500/20 text-xs h-8 gap-1.5 px-2 ml-auto"
            >
              <Trash2 className="size-3.5" />
              <span>O‘chirish</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
