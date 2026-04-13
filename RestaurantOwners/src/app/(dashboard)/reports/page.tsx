"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, ShoppingCart, TrendingDown, Wallet, Percent, BarChart3 } from "lucide-react";

interface Stats {
  totalSales: number;
  totalCommission: number;
  netPayout: number;
  orderCount: number;
  activeOrders: number;
  commissionRate: number;
  isOpen: boolean;
  hasWebsiteSubscription: boolean;
}

function fmt(n: number) {
  return `$${Number(n).toFixed(2)}`;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/restaurant/stats")
      .then((r) => r.json())
      .then((d) => { if (!d.error) setStats(d); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground p-8">Loading...</p>;
  if (!stats) return <p className="text-sm text-destructive p-8">Could not load reports.</p>;

  const commissionPercent = (Number(stats.commissionRate) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="View your sales, commissions, and payout summary" />

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums">{fmt(stats.totalSales)}</div>
            <p className="text-xs text-muted-foreground mt-1">Gross revenue from completed orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Commission Deducted</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums text-destructive">{fmt(stats.totalCommission)}</div>
            <p className="text-xs text-muted-foreground mt-1">Platform fee at {commissionPercent}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Payout</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tabular-nums text-green-600">{fmt(stats.netPayout)}</div>
            <p className="text-xs text-muted-foreground mt-1">Your earnings after commission</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orderCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeOrders} currently active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Commission Rate</span>
              </div>
              <p className="text-3xl font-bold font-mono tabular-nums">{commissionPercent}%</p>
              <p className="text-xs text-muted-foreground">
                {stats.hasWebsiteSubscription ? "Reduced rate with website subscription" : "Standard rate — get a website subscription for 5%"}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">How It Works</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order total</span>
                  <span className="font-mono">100%</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>Platform commission</span>
                  <span className="font-mono">-{commissionPercent}%</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Your payout</span>
                  <span className="font-mono">{(100 - Number(commissionPercent)).toFixed(1)}%</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Store</span>
                  <Badge variant={stats.isOpen ? "default" : "secondary"}>
                    {stats.isOpen ? "Open" : "Closed"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Subscription</span>
                  <Badge variant={stats.hasWebsiteSubscription ? "default" : "outline"}>
                    {stats.hasWebsiteSubscription ? "Active" : "None"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
