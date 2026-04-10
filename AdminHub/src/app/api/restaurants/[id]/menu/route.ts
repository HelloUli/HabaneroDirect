import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: restaurantId } = await params;
  const sb = createServiceRoleClient();

  const [menusRes, catsRes, itemsRes, groupsRes, modsRes] = await Promise.all([
    sb.from("menus").select("*").eq("restaurant_id", restaurantId).order("sort_order"),
    sb.from("menu_categories").select("*, menus!inner(restaurant_id)").eq("menus.restaurant_id", restaurantId).order("sort_order"),
    sb.from("menu_items").select("*, menu_categories!inner(menu_id, menus!inner(restaurant_id))").eq("menu_categories.menus.restaurant_id", restaurantId).order("sort_order"),
    sb.from("modifier_groups").select("*, menu_items!inner(category_id, menu_categories!inner(menu_id, menus!inner(restaurant_id)))").eq("menu_items.menu_categories.menus.restaurant_id", restaurantId).order("sort_order"),
    sb.from("modifiers").select("*, modifier_groups!inner(menu_item_id, menu_items!inner(category_id, menu_categories!inner(menu_id, menus!inner(restaurant_id))))").eq("modifier_groups.menu_items.menu_categories.menus.restaurant_id", restaurantId).order("sort_order"),
  ]);

  return NextResponse.json({
    menus: menusRes.data ?? [],
    categories: catsRes.data ?? [],
    items: itemsRes.data ?? [],
    modifierGroups: groupsRes.data ?? [],
    modifiers: modsRes.data ?? [],
  });
}

type Action =
  | "create_menu"
  | "create_category" | "update_category" | "delete_category"
  | "create_item" | "update_item" | "delete_item"
  | "create_modifier_group" | "update_modifier_group" | "delete_modifier_group"
  | "create_modifier" | "update_modifier" | "delete_modifier";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: restaurantId } = await params;
  const { action, data, id: entityId } = (await req.json()) as {
    action: Action;
    data?: Record<string, unknown>;
    id?: string;
  };

  const sb = createServiceRoleClient();

  switch (action) {
    case "create_menu": {
      const { data: row, error } = await sb.from("menus").insert({
        restaurant_id: restaurantId,
        name: (data?.name as string) || "Main Menu",
        description: (data?.description as string) || null,
        is_active: true,
        sort_order: (data?.sort_order as number) ?? 0,
        external_id: null,
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(row, { status: 201 });
    }

    case "create_category": {
      const { data: row, error } = await sb.from("menu_categories").insert({
        menu_id: data?.menu_id as string,
        name: (data?.name as string) || "New Category",
        description: (data?.description as string) || null,
        is_active: true,
        sort_order: (data?.sort_order as number) ?? 0,
        external_id: null,
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(row, { status: 201 });
    }

    case "update_category": {
      const { data: row, error } = await sb.from("menu_categories").update(data!).eq("id", entityId!).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(row);
    }

    case "delete_category": {
      const { error } = await sb.from("menu_categories").delete().eq("id", entityId!);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    case "create_item": {
      const { data: row, error } = await sb.from("menu_items").insert({
        category_id: data?.category_id as string,
        name: (data?.name as string) || "New Item",
        description: (data?.description as string) || null,
        price: (data?.price as number) ?? 0,
        image_url: (data?.image_url as string) || null,
        is_available: true,
        sort_order: (data?.sort_order as number) ?? 0,
        prep_time_minutes: null,
        external_id: null,
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(row, { status: 201 });
    }

    case "update_item": {
      const { data: row, error } = await sb.from("menu_items").update(data!).eq("id", entityId!).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(row);
    }

    case "delete_item": {
      const { error } = await sb.from("menu_items").delete().eq("id", entityId!);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    case "create_modifier_group": {
      const { data: row, error } = await sb.from("modifier_groups").insert({
        menu_item_id: data?.menu_item_id as string,
        name: (data?.name as string) || "New Group",
        description: (data?.description as string) || null,
        min_selections: (data?.min_selections as number) ?? 0,
        max_selections: (data?.max_selections as number) ?? 1,
        is_required: (data?.is_required as boolean) ?? false,
        sort_order: (data?.sort_order as number) ?? 0,
        external_id: null,
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(row, { status: 201 });
    }

    case "update_modifier_group": {
      const { data: row, error } = await sb.from("modifier_groups").update(data!).eq("id", entityId!).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(row);
    }

    case "delete_modifier_group": {
      const { error } = await sb.from("modifier_groups").delete().eq("id", entityId!);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    case "create_modifier": {
      const { data: row, error } = await sb.from("modifiers").insert({
        modifier_group_id: data?.modifier_group_id as string,
        name: (data?.name as string) || "New Option",
        price: (data?.price as number) ?? 0,
        is_default: (data?.is_default as boolean) ?? false,
        is_available: true,
        sort_order: (data?.sort_order as number) ?? 0,
        external_id: null,
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(row, { status: 201 });
    }

    case "update_modifier": {
      const { data: row, error } = await sb.from("modifiers").update(data!).eq("id", entityId!).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(row);
    }

    case "delete_modifier": {
      const { error } = await sb.from("modifiers").delete().eq("id", entityId!);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
