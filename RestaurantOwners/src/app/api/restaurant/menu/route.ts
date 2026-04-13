import { NextResponse } from "next/server";
import { getRestaurantSession } from "@/lib/session";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await getRestaurantSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceRoleClient();
  const rid = session.restaurantId;

  const { data: menus } = await supabase
    .from("menus")
    .select("id, name, is_active, sort_order")
    .eq("restaurant_id", rid)
    .order("sort_order");

  const menuIds = (menus ?? []).map((m) => m.id);

  if (menuIds.length === 0) {
    return NextResponse.json({
      menus: [],
      categories: [],
      items: [],
      modifierGroups: [],
      modifiers: [],
    });
  }

  const { data: categories } = await supabase
    .from("menu_categories")
    .select("id, menu_id, name, description, is_active, sort_order")
    .in("menu_id", menuIds)
    .order("sort_order");

  const catIds = (categories ?? []).map((c) => c.id);

  const { data: items } = catIds.length > 0
    ? await supabase
        .from("menu_items")
        .select("id, category_id, name, description, price, image_url, is_available, sort_order")
        .in("category_id", catIds)
        .order("sort_order")
    : { data: [] };

  const itemIds = (items ?? []).map((i) => i.id);

  const { data: modifierGroups } = itemIds.length > 0
    ? await supabase
        .from("modifier_groups")
        .select("id, menu_item_id, name, description, min_selections, max_selections, is_required, sort_order")
        .in("menu_item_id", itemIds)
        .order("sort_order")
    : { data: [] };

  const groupIds = (modifierGroups ?? []).map((g) => g.id);

  const { data: modifiers } = groupIds.length > 0
    ? await supabase
        .from("modifiers")
        .select("id, modifier_group_id, name, price, is_default, is_available, sort_order")
        .in("modifier_group_id", groupIds)
        .order("sort_order")
    : { data: [] };

  return NextResponse.json({
    menus: menus ?? [],
    categories: categories ?? [],
    items: items ?? [],
    modifierGroups: modifierGroups ?? [],
    modifiers: modifiers ?? [],
  });
}

export async function PATCH(request: Request) {
  const session = await getRestaurantSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "owner") {
    return NextResponse.json({ error: "Owners only" }, { status: 403 });
  }

  const body = await request.json();
  const { itemId, is_available } = body;

  if (!itemId || typeof is_available !== "boolean") {
    return NextResponse.json({ error: "itemId and is_available required" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("menu_items")
    .update({ is_available })
    .eq("id", itemId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
