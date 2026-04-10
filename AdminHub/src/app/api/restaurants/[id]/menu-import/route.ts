import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Expected JSON shape:
 * {
 *   name: "Main Menu",
 *   categories: [{
 *     name: "Appetizers",
 *     items: [{
 *       name: "Nachos", price: 9.99, description: "...",
 *       modifier_groups: [{
 *         name: "Toppings", min_selections: 0, max_selections: 3, is_required: false,
 *         modifiers: [{ name: "Jalapeños", price: 0.5 }, ...]
 *       }]
 *     }]
 *   }]
 * }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: restaurantId } = await params;
  const body = await req.json();
  const supabase = createServiceRoleClient();

  const { data: menu, error: menuErr } = await supabase
    .from("menus")
    .insert({
      restaurant_id: restaurantId,
      name: body.name || "Main Menu",
      description: body.description || null,
      is_active: true,
      sort_order: 0,
      external_id: null,
    })
    .select()
    .single();

  if (menuErr) return NextResponse.json({ error: menuErr.message }, { status: 500 });

  let catOrder = 0;
  for (const cat of body.categories ?? []) {
    const { data: category, error: catErr } = await supabase
      .from("menu_categories")
      .insert({
        menu_id: menu.id,
        name: cat.name,
        description: cat.description || null,
        is_active: true,
        sort_order: catOrder++,
        external_id: null,
      })
      .select()
      .single();

    if (catErr) continue;

    let itemOrder = 0;
    for (const item of cat.items ?? []) {
      const { data: menuItem, error: itemErr } = await supabase
        .from("menu_items")
        .insert({
          category_id: category.id,
          name: item.name,
          description: item.description || null,
          price: item.price ?? 0,
          image_url: item.image_url || null,
          is_available: true,
          sort_order: itemOrder++,
          prep_time_minutes: item.prep_time_minutes ?? null,
          external_id: null,
        })
        .select()
        .single();

      if (itemErr || !menuItem) continue;

      let groupOrder = 0;
      for (const group of item.modifier_groups ?? []) {
        const { data: modGroup, error: groupErr } = await supabase
          .from("modifier_groups")
          .insert({
            menu_item_id: menuItem.id,
            name: group.name,
            description: group.description || null,
            min_selections: group.min_selections ?? 0,
            max_selections: group.max_selections ?? 1,
            is_required: group.is_required ?? false,
            sort_order: groupOrder++,
            external_id: null,
          })
          .select()
          .single();

        if (groupErr || !modGroup) continue;

        let modOrder = 0;
        for (const mod of group.modifiers ?? []) {
          await supabase.from("modifiers").insert({
            modifier_group_id: modGroup.id,
            name: mod.name,
            price: mod.price ?? 0,
            is_default: mod.is_default ?? false,
            is_available: true,
            sort_order: modOrder++,
            external_id: null,
          });
        }
      }
    }
  }

  return NextResponse.json({ ok: true, menu_id: menu.id });
}
