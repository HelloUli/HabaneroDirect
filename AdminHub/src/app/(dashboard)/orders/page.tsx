"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ShoppingCart } from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  order_number: string;
  status: string;
  type: string;
  total: number;
  commission_amount: number;
  net_restaurant_payout: number;
  customer_id: string;
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setOrders(d); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="View and manage all platform orders" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium">No orders yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Orders will appear here once customers begin placing orders through your restaurant ordering pages.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-right">Payout</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs font-medium">#{o.order_number}</TableCell>
                    <TableCell>{(o.restaurants as { name: string } | null)?.name ?? "—"}</TableCell>
                    <TableCell className="capitalize">{o.type}</TableCell>
                    <TableCell>
                      <Badge className={statusColor[o.status] ?? ""} variant="secondary">
                        {o.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{fmt(o.total)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{fmt(o.commission_amount)}</TableCell>
                    <TableCell className="text-right">{fmt(o.net_restaurant_payout)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {format(new Date(o.created_at), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
