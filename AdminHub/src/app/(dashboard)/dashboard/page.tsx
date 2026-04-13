"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

interface Stats {
  restaurants: number;
  orders: number;
  revenue: number;
  commission: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  restaurants: { name: string } | null;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

const statusColor: Record<string, string> = {
  placed: "bg-blue-100 text-blue-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  preparing: "bg-yellow-100 text-yellow-800",
  ready: "bg-green-100 text-green-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-green-200 text-green-900",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ restaurants: 0, orders: 0, revenue: 0, commission: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/orders?limit=5").then((r) => r.json()),
    ]).then(([s, o]) => {
      if (s.restaurants !== undefined) setStats(s);
      if (Array.isArray(o)) setRecentOrders(o);
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { title: "Total Restaurants", value: stats.restaurants.toString(), icon: Store },
    { title: "Total Orders", value: stats.orders.toString(), icon: ShoppingCart },
    { title: "Revenue", value: fmt(stats.revenue), icon: DollarSign },
    { title: "Commission Earned", value: fmt(stats.commission), icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of the Habanero Direct platform" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Orders</CardTitle></CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No orders yet. Orders appear here as customers place them.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50" onClick={() => router.push("/orders")}>
                  <div>
                    <p className="text-sm font-medium">#{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">{(o.restaurants as { name: string } | null)?.name ?? "Unknown"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColor[o.status] ?? ""} variant="secondary">{o.status.replace(/_/g, " ")}</Badge>
                    <span className="text-sm font-medium">{fmt(o.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
