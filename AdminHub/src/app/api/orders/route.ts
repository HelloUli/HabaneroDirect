import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const restaurantId = searchParams.get("restaurant_id");
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const supabase = createServiceRoleClient();

  let query = supabase
    .from("orders")
    .select("*, restaurants(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status as Database["public"]["Enums"]["order_status"]);
  if (restaurantId) query = query.eq("restaurant_id", restaurantId);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
