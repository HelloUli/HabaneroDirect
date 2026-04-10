import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceRoleClient();

  const [restaurants, orders, revenue, commission] = await Promise.all([
    supabase.from("restaurants").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("total.sum()"),
    supabase.from("orders").select("commission_amount.sum()"),
  ]);

  const totalRevenue = (revenue.data as Record<string, number>[])?.[0]?.sum ?? 0;
  const totalCommission = (commission.data as Record<string, number>[])?.[0]?.sum ?? 0;

  return NextResponse.json({
    restaurants: restaurants.count ?? 0,
    orders: orders.count ?? 0,
    revenue: totalRevenue,
    commission: totalCommission,
  });
}
