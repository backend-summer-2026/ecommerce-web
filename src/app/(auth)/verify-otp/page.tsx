'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function VerifyOtpPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('verify');
      toast.success('Tasdiqlash kodi elektron pochtangizga yuborildi');
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.info('OTP tasdiqlash Phase 1 da to\'liq ulanadi');
    }, 600);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold">
          {step === 'send' ? 'OTP kod olish' : 'Kodni tasdiqlash'}
        </CardTitle>
        <CardDescription>
          {step === 'send'
            ? 'Bir martalik tasdiqlash kodini olish uchun emailingizni kiriting'
            : `${email} manziliga yuborilgan 6 xonali kodni kiriting`}
        </CardDescription>
      </CardHeader>

      {step === 'send' ? (
        <form onSubmit={handleSendOtp}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Elektron pochta</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Kutilmoqda...' : 'Kod yuborish'}
            </Button>
            <Link href="/login" className="text-xs text-center text-muted-foreground hover:underline">
              Parol bilan kirishga qaytish
            </Link>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">6 xonali tasdiqlash kodi</label>
              <Input
                type="text"
                maxLength={6}
                placeholder="123456"
                className="text-center tracking-widest text-lg font-mono"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash va Kirish'}
            </Button>
            <button
              type="button"
              onClick={() => setStep('send')}
              className="text-xs text-muted-foreground hover:underline"
            >
              Emailni qayta kiritish
            </button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
