"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History } from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  order_number: string;
  status: string;
  type: string;
  total: number;
  net_restaurant_payout: number;
  commission_amount: number;
  placed_at: string | null;
  created_at: string;
}

function fmt(n: number) {
  return `$${Number(n).toFixed(2)}`;
}

const statusColors: Record<string, string> = {
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
  rejected: "bg-red-100 text-red-800",
  out_for_delivery: "bg-blue-100 text-blue-800",
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/restaurant/orders?status=delivered,cancelled,rejected,out_for_delivery&limit=100")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setOrders(d); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground p-8">Loading...</p>;

  return (
    <div className="space-y-6">
      <PageHeader title="Order History" description="View past completed, cancelled, and rejected orders" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Past Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No order history yet</p>
              <p className="text-xs text-muted-foreground/60">Completed orders will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-right">Net Payout</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      #{order.order_number}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(order.placed_at || order.created_at), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {order.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums">
                      {fmt(order.total)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums text-muted-foreground">
                      -{fmt(order.commission_amount)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm tabular-nums font-medium">
                      {fmt(order.net_restaurant_payout)}
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
