import { NextResponse } from "next/server";
import { getRestaurantSession } from "@/lib/session";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export async function GET() {
  const session = await getRestaurantSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", session.restaurantId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const session = await getRestaurantSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "owner") {
    return NextResponse.json({ error: "Owners only" }, { status: 403 });
  }

  const body = await request.json();

  type RestaurantUpdate = Database["public"]["Tables"]["restaurants"]["Update"];
  const updates: RestaurantUpdate = {};

  if ("is_open" in body) updates.is_open = body.is_open;
  if ("operating_hours" in body) updates.operating_hours = body.operating_hours;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("restaurants")
    .update(updates)
    .eq("id", session.restaurantId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
