import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Users, PackageCheck } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Umumiy Ko'rsatkichlar (KPI)</h2>
        <p className="text-sm text-muted-foreground">
          Do'kondagi savdo, buyurtmalar va zaxira holati bo'yicha tezkor ma'lumotlar.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami Tushum</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128,450,000 UZS</div>
            <p className="text-xs text-emerald-600 font-medium">+18.2% o'tgan oyga nisbatan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yangi Buyurtmalar</CardTitle>
            <ShoppingCart className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+245</div>
            <p className="text-xs text-emerald-600 font-medium">+12% faol savdolar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faol Xaridorlar</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,820</div>
            <p className="text-xs text-muted-foreground">Oylik faol mijozlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ombor Qoldig'i</CardTitle>
            <PackageCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,120 dona</div>
            <p className="text-xs text-amber-600 font-medium">3 ta kam qolgan tovar</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
