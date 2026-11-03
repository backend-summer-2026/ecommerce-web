'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Phase 1 da to'liq auth oqimi ulanadi
    setTimeout(() => {
      setLoading(false);
      toast.info('Kirish tizimi Phase 1 da to\'liq ulanadi');
    }, 600);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold">Hisobga kirish</CardTitle>
        <CardDescription>
          Tizimga kirish uchun elektron pochta va parolingizni kiriting
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Parol</label>
              <Link href="/verify-otp" className="text-xs text-primary hover:underline">
                OTP bilan kirish
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Hisobingiz yo'qmi?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Ro'yxatdan o'tish
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
