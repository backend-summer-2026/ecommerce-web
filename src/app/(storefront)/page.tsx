import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, CreditCard, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center sm:px-6">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-xs font-medium backdrop-blur">
              <Sparkles className="size-3.5 text-primary" />
              <span>Yangi mavsum mahsulotlari chegirmada</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground">
              Orzuingizdagi texnika va qulay xaridlar
            </h1>

            <p className="text-lg text-muted-foreground sm:text-xl">
              Payme, Click va qulay bo'lib to'lash imkoniyati bilan sevimli tovarlaringizni buyurtma qiling. Toshkent bo'ylab 24 soatda yetkazib beramiz.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/catalog">
                <Button size="lg" className="gap-2">
                  <span>Katalogni ko'rish</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" size="lg">
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Afzalliklar */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Card className="border-border/60 bg-card/50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <Truck className="size-6" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Tezkor yetkazib berish</h3>
                <p className="text-xs text-muted-foreground">O'zbekiston bo'ylab ishonchli kuryerlik</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <CreditCard className="size-6" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Xavfsiz to'lovlar</h3>
                <p className="text-xs text-muted-foreground">Payme, Click va 1-Click to'lov</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Rasmiy kafolat</h3>
                <p className="text-xs text-muted-foreground">100% original tovarlar va servis</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
