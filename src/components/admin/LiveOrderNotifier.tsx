'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, BellRing, Radio, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * Web Audio API orqali tashqi faylsiz chiroyli polifonik bildirishnoma qo'ng'irog'i chalish
 */
function playChimeSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, now); // A4
    osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.2); // E5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch {
    // Brauzer audio ruxsati berilmagan bo'lsa xatolikni yashirish
  }
}

export function LiveOrderNotifier() {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [lastEventTime, setLastEventTime] = useState<string>('');

  // Demo / SSE event listener simulation for live events
  useEffect(() => {
    // Har 90 soniyada yangi simulyatsiya qilingan buyurtma ogohlantirishi (agar faol bo'lsa)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        const orderNum = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        const amount = `${(Math.floor(Math.random() * 80) + 10) * 50_000} so'm`;

        if (isAudioEnabled) {
          playChimeSound();
        }

        setLastEventTime(new Date().toLocaleTimeString('uz-UZ'));
        toast.info(
          <div className="flex flex-col gap-1">
            <span className="font-bold flex items-center gap-1.5 text-foreground">
              <BellRing className="size-3.5 text-primary" />
              <span>Yangi Buyurtma Kelib Tushdi!</span>
            </span>
            <span className="text-xs text-muted-foreground">
              {orderNum} • Summa: <strong>{amount}</strong>
            </span>
          </div>,
          {
            duration: 5000,
          }
        );
      }
    }, 90000);

    return () => clearInterval(interval);
  }, [isAudioEnabled]);

  const triggerTestAlert = () => {
    playChimeSound();
    toast.success('Jonli audio bildirishnoma muvaffaqiyatli sinovdan o‘tkazildi!');
  };

  return (
    <div className="flex items-center gap-2">
      {/* Jonli ulanish belgisi */}
      <div
        className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-600 select-none"
        title="Real-time hodisalar markazi ulangan"
      >
        <span className="relative flex size-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
        </span>
        <span>Live</span>
      </div>

      {/* Ovozni yoqish / o'chirish tugmasi */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          const next = !isAudioEnabled;
          setIsAudioEnabled(next);
          if (next) {
            triggerTestAlert();
          } else {
            toast('Ovozli ogohlantirishlar o‘chirildi');
          }
        }}
        className="size-9 text-muted-foreground hover:text-foreground"
        title={isAudioEnabled ? "Ovozli bildirishnomalarni o'chirish" : "Ovozli bildirishnomalarni yoqish"}
      >
        {isAudioEnabled ? (
          <Volume2 className="size-4 text-primary" />
        ) : (
          <VolumeX className="size-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
