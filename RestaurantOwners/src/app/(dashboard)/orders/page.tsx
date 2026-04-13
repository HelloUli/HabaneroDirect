"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ClipboardList, Clock, CheckCircle, XCircle, ChefHat } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions: string | null;
  order_item_modifiers: { id: string; name: string; price: number }[];
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  type: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  tax_amount: number;
  tip_amount: number;
  special_instructions: string | null;
  placed_at: string | null;
  created_at: string;
  order_items: OrderItem[];
}

function fmt(n: number) {
  return `$${Number(n).toFixed(2)}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/restaurant/orders?status=placed,confirmed,preparing,ready");
    const data = await res.json();
    if (Array.isArray(data)) setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  async function updateStatus(orderId: string, status: string) {
    const res = await fetch("/api/restaurant/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    const data = await res.json();
    if (data.id) {
      setOrders((prev) => prev.map((o) => (o.id === data.id ? data : o)));
    }
  }

  const newOrders = orders.filter((o) => o.status === "placed");
  const inProgress = orders.filter((o) => o.status === "confirmed" || o.status === "preparing");
  const ready = orders.filter((o) => o.status === "ready");

  if (loading) return <p className="text-sm text-muted-foreground p-8">Loading orders...</p>;

  return (
    <div className="space-y-6">
      <PageHeader title="Live Orders" description="Manage incoming orders in real time">
        <Badge variant="outline" className="text-sm">
          {orders.length} active
        </Badge>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <OrderColumn
          title="New"
          color="bg-yellow-500"
          orders={newOrders}
          actions={(order) => (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => updateStatus(order.id, "confirmed")}>
                <CheckCircle className="mr-1 h-3.5 w-3.5" />Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus(order.id, "rejected")}>
                <XCircle className="mr-1 h-3.5 w-3.5" />Reject
              </Button>
            </div>
          )}
        />
        <OrderColumn
          title="In Progress"
          color="bg-blue-500"
          orders={inProgress}
          actions={(order) => (
            <div className="flex gap-2">
              {order.status === "confirmed" && (
                <Button size="sm" variant="secondary" onClick={() => updateStatus(order.id, "preparing")}>
                  <ChefHat className="mr-1 h-3.5 w-3.5" />Preparing
                </Button>
              )}
              <Button size="sm" onClick={() => updateStatus(order.id, "ready")}>
                <CheckCircle className="mr-1 h-3.5 w-3.5" />Ready
              </Button>
            </div>
          )}
        />
        <OrderColumn
          title="Ready"
          color="bg-green-500"
          orders={ready}
          actions={(order) => (
            <Badge variant="secondary" className="text-xs">
              {order.type === "delivery" ? "Awaiting pickup" : "Customer notified"}
            </Badge>
          )}
        />
      </div>
    </div>
  );
}

function OrderColumn({
  title,
  color,
  orders,
  actions,
}: {
  title: string;
  color: string;
  orders: Order[];
  actions: (order: Order) => React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${color}`} />
        <h2 className="font-semibold">{title}</h2>
        <Badge variant="secondary" className="ml-auto">{orders.length}</Badge>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardList className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No {title.toLowerCase()} orders</p>
          </CardContent>
        </Card>
      ) : (
        orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold">#{order.order_number}</span>
                  <Badge variant={order.type === "delivery" ? "default" : "secondary"} className="text-xs">
                    {order.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {timeAgo(order.placed_at || order.created_at)}
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between text-sm">
                    <div className="flex-1">
                      <span>{item.quantity}x {item.name}</span>
                      {item.order_item_modifiers.length > 0 && (
                        <p className="text-xs text-muted-foreground pl-4">
                          {item.order_item_modifiers.map((m) => m.name).join(", ")}
                        </p>
                      )}
                      {item.special_instructions && (
                        <p className="text-xs text-muted-foreground italic pl-4">
                          &ldquo;{item.special_instructions}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-mono tabular-nums">{fmt(item.total_price)}</span>
                  </div>
                ))}
              </div>

              {order.special_instructions && (
                <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">
                  {order.special_instructions}
                </p>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-semibold">{fmt(order.total)}</span>
              </div>

              {actions(order)}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
