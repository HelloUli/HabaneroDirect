"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  UtensilsCrossed,
} from "lucide-react";

interface Menu { id: string; name: string; is_active: boolean; sort_order: number }
interface Category { id: string; menu_id: string; name: string; description: string | null; is_active: boolean; sort_order: number }
interface Item { id: string; category_id: string; name: string; description: string | null; price: number; image_url: string | null; is_available: boolean; sort_order: number }
interface ModGroup { id: string; menu_item_id: string; name: string; min_selections: number; max_selections: number; is_required: boolean; sort_order: number }
interface Modifier { id: string; modifier_group_id: string; name: string; price: number; is_default: boolean; is_available: boolean; sort_order: number }

function fmt(n: number) {
  return `$${Number(n).toFixed(2)}`;
}

export default function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [modGroups, setModGroups] = useState<ModGroup[]>([]);
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const res = await fetch("/api/restaurant/menu");
    const d = await res.json();
    setMenus(d.menus ?? []);
    setCategories(d.categories ?? []);
    setItems(d.items ?? []);
    setModGroups(d.modifierGroups ?? []);
    setModifiers(d.modifiers ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleItemAvailability(itemId: string, available: boolean) {
    await fetch("/api/restaurant/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, is_available: available }),
    });
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, is_available: available } : i));
  }

  function toggleCat(id: string) {
    setExpandedCats((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleItem(id: string) {
    setExpandedItems((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  if (loading) return <p className="text-sm text-muted-foreground p-8">Loading menu...</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu"
        description="View and manage item availability. Menu structure is managed by Habanero Direct."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{menus[0]?.name || "Menu"}</CardTitle>
          <p className="text-xs text-muted-foreground">{categories.length} categories · {items.length} items</p>
        </CardHeader>
        <CardContent className="space-y-3 p-0">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <UtensilsCrossed className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No menu has been set up yet</p>
              <p className="text-xs text-muted-foreground/60">Your menu will appear here once it&apos;s configured by Habanero Direct</p>
            </div>
          ) : (
            categories.sort((a, b) => a.sort_order - b.sort_order).map((cat) => {
              const catItems = items.filter((i) => i.category_id === cat.id).sort((a, b) => a.sort_order - b.sort_order);
              const isExpanded = expandedCats.has(cat.id);

              return (
                <div key={cat.id} className="border-t first:border-t-0">
                  <div
                    className="flex items-center gap-2 px-4 py-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleCat(cat.id)}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                    {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                    <span className="font-medium text-sm flex-1">{cat.name}</span>
                    <Badge variant="secondary" className="text-xs">{catItems.length} items</Badge>
                  </div>

                  {isExpanded && (
                    <div className="divide-y">
                      {catItems.map((item) => {
                        const itemExpanded = expandedItems.has(item.id);
                        const itemGroups = modGroups.filter((g) => g.menu_item_id === item.id).sort((a, b) => a.sort_order - b.sort_order);

                        return (
                          <div key={item.id}>
                            <div className="flex items-center gap-3 px-6 py-2.5 hover:bg-muted/20">
                              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                              <button onClick={() => toggleItem(item.id)} className="shrink-0">
                                {itemExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium">{item.name}</span>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                                )}
                              </div>
                              <span className="text-sm font-mono tabular-nums">{fmt(item.price)}</span>
                              <div className="flex items-center gap-1.5">
                                <Switch
                                  checked={item.is_available}
                                  onCheckedChange={(c) => toggleItemAvailability(item.id, c)}
                                  size="sm"
                                />
                                <span className="text-xs text-muted-foreground w-14">
                                  {item.is_available ? "Available" : "Unavail."}
                                </span>
                              </div>
                            </div>

                            {itemExpanded && itemGroups.length > 0 && (
                              <div className="px-10 pb-3 space-y-2 bg-muted/10">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Modifier Groups</span>
                                {itemGroups.map((group) => {
                                  const groupMods = modifiers.filter((m) => m.modifier_group_id === group.id).sort((a, b) => a.sort_order - b.sort_order);
                                  return (
                                    <div key={group.id} className="rounded-md border bg-background p-3 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium flex-1">{group.name}</span>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          {group.is_required && <Badge variant="outline" className="text-[10px]">Required</Badge>}
                                          <span>Min: {group.min_selections}</span>
                                          <span>Max: {group.max_selections}</span>
                                        </div>
                                      </div>
                                      <Separator />
                                      {groupMods.map((mod) => (
                                        <div key={mod.id} className="flex items-center gap-2 pl-2 text-sm">
                                          <span className="flex-1">{mod.name}</span>
                                          {mod.price > 0 && (
                                            <span className="text-xs font-mono tabular-nums text-muted-foreground">+{fmt(mod.price)}</span>
                                          )}
                                          {mod.is_default && (
                                            <Badge variant="secondary" className="text-[10px]">Default</Badge>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
