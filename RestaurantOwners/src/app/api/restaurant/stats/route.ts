import { NextResponse } from "next/server";
import { getRestaurantSession } from "@/lib/session";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await getRestaurantSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceRoleClient();
  const rid = session.restaurantId;

  const { data: orders } = await supabase
    .from("orders")
    .select("total, commission_amount, net_restaurant_payout, status, type, placed_at")
    .eq("restaurant_id", rid);

  const allOrders = orders ?? [];
  const completed = allOrders.filter((o) =>
    ["delivered", "ready", "out_for_delivery"].includes(o.status)
  );

  const totalSales = completed.reduce((sum, o) => sum + Number(o.total), 0);
  const totalCommission = completed.reduce((sum, o) => sum + Number(o.commission_amount), 0);
  const netPayout = completed.reduce((sum, o) => sum + Number(o.net_restaurant_payout), 0);
  const orderCount = allOrders.length;
  const activeOrders = allOrders.filter((o) =>
    ["placed", "confirmed", "preparing", "ready"].includes(o.status)
  ).length;

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("commission_rate, is_open, has_website_subscription")
    .eq("id", rid)
    .single();

  return NextResponse.json({
    totalSales,
    totalCommission,
    netPayout,
    orderCount,
    activeOrders,
    commissionRate: restaurant?.commission_rate ?? 0,
    isOpen: restaurant?.is_open ?? false,
    hasWebsiteSubscription: restaurant?.has_website_subscription ?? false,
  });
}
