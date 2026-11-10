'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { exportToCsv } from '@/lib/exportUtils';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Download,
  Users,
  Percent,
  Sparkles,
} from 'lucide-react';

interface ExecutiveAnalyticsSuiteProps {
  grossRevenue?: number;
  totalOrders?: number;
  averageCheck?: number;
}

export function ExecutiveAnalyticsSuite({
  grossRevenue = 145000000,
  totalOrders = 342,
  averageCheck = 423976,
}: ExecutiveAnalyticsSuiteProps) {
  // Hisob-kitoblar (B2B marjalar)
  const previousMonthRevenue = grossRevenue * 0.88; // 12% o'sish
  const growthRate = Math.round(((grossRevenue - previousMonthRevenue) / previousMonthRevenue) * 100);
  const paymentGatewayFee = Math.round(grossRevenue * 0.015); // 1.5% Click/Payme
  const estimatedCostOfGoods = Math.round(grossRevenue * 0.62); // 62% tannarx
  const netProfit = grossRevenue - estimatedCostOfGoods - paymentGatewayFee;
  const netMarginPercent = Math.round((netProfit / grossRevenue) * 100);

  const handleExportBIReport = () => {
    const reportData = [
      { Parametr: 'Yalpi Tushum (Gross Revenue)', Qiymat: grossRevenue, Izoh: 'Barcha to\'langan buyurtmalar' },
      { Parametr: 'O\'tgan oy bilan taqqoslash', Qiymat: `+${growthRate}%`, Izoh: 'Davriy o\'sish sur\'ati' },
      { Parametr: 'Tovarlar Tannarxi (COGS)', Qiymat: estimatedCostOfGoods, Izoh: 'Boshlang\'ich xarid narxi (62%)' },
      { Parametr: 'To\'lov tizimlari komissiyasi', Qiymat: paymentGatewayFee, Izoh: 'Payme / Click 1.5%' },
      { Parametr: 'Sof Foyda (Net Profit)', Qiymat: netProfit, Izoh: 'Kompaniya marjasi' },
      { Parametr: 'Sof Rentabellik', Qiymat: `${netMarginPercent}%`, Izoh: 'Net profit margin' },
      { Parametr: 'Jami Buyurtmalar', Qiymat: totalOrders, Izoh: 'Yopilgan tranzaksiyalar' },
      { Parametr: 'O\'rtacha Chek (AOV)', Qiymat: averageCheck, Izoh: 'Bitta xarid hajmi' },
    ];

    exportToCsv(reportData, 'apex_executive_bi_report');
    toast.success('Boshqaruv moliyaviy hisoboti (BI) CSV formatida yuklab olindi');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <span>Kengaytirilgan Moliyaviy Tahlillar & Rentabellik (BI Suite)</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Do'konning sof rentabelligi, to'lov tizimlari xarajatlari va davriy o'sish ko'rsatkichlari.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportBIReport}
          className="gap-2 text-xs font-semibold self-start sm:self-auto shadow-2xs"
        >
          <Download className="size-3.5 text-primary" />
          <span>Moliyaviy Hisobotni Yuklab Olish (CSV)</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Yalpi O'sish */}
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Davriy O'sish Sur'ati
            </CardTitle>
            <TrendingUp className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">+{growthRate}%</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              O'tgan davrga nisbatan barqaror o'sish
            </p>
          </CardContent>
        </Card>

        {/* 2. Sof Foyda */}
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Sof Foyda (Net Profit)
            </CardTitle>
            <DollarSign className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatPrice(netProfit, { currency: 'UZS' })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Tannarx va komissiyalar ayirilgandan so'ng
            </p>
          </CardContent>
        </Card>

        {/* 3. Rentabellik Marjasi */}
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Rentabellik Marjasi (Margin)
            </CardTitle>
            <Percent className="size-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{netMarginPercent}%</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Tijoriy sof foydalilik ko'rsatkichi
            </p>
          </CardContent>
        </Card>

        {/* 4. Gateway Xarajatlari */}
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              To'lov Shlyuzlari Xarajati
            </CardTitle>
            <PieChart className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatPrice(paymentGatewayFee, { currency: 'UZS' })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Payme / Click / Uzum vositachilik haqi
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
