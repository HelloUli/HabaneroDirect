import { NextResponse } from "next/server";
import { getRestaurantSession } from "@/lib/session";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export async function GET(request: Request) {
  const session = await getRestaurantSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "50");

  const supabase = createServiceRoleClient();
  let query = supabase
    .from("orders")
    .select("*, order_items(*, order_item_modifiers(*))")
    .eq("restaurant_id", session.restaurantId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) {
    const statuses = status.split(",") as Database["public"]["Enums"]["order_status"][];
    query = query.in("status", statuses);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(request: Request) {
  const session = await getRestaurantSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { orderId, status } = body;

  if (!orderId || !status) {
    return NextResponse.json({ error: "orderId and status required" }, { status: 400 });
  }

  const validStatuses = ["confirmed", "preparing", "ready", "rejected"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, restaurant_id, status")
    .eq("id", orderId)
    .eq("restaurant_id", session.restaurantId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];
  const updates: OrderUpdate = { status: status as OrderUpdate["status"] };

  if (status === "confirmed") updates.confirmed_at = now;
  else if (status === "preparing") updates.preparing_at = now;
  else if (status === "ready") updates.ready_at = now;
  else if (status === "rejected") updates.cancelled_at = now;

  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", orderId)
    .select("*, order_items(*, order_item_modifiers(*))")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
