"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  Pencil,
  GripVertical,
  Check,
  X,
  Upload,
} from "lucide-react";

/* ─── types (mirrors DB) ─── */
interface Menu { id: string; name: string; is_active: boolean; sort_order: number }
interface Category { id: string; menu_id: string; name: string; description: string | null; is_active: boolean; sort_order: number }
interface Item { id: string; category_id: string; name: string; description: string | null; price: number; image_url: string | null; is_available: boolean; sort_order: number }
interface ModGroup { id: string; menu_item_id: string; name: string; description: string | null; min_selections: number; max_selections: number; is_required: boolean; sort_order: number }
interface Modifier { id: string; modifier_group_id: string; name: string; price: number; is_default: boolean; is_available: boolean; sort_order: number }

function fmt(n: number) {
  return `$${n.toFixed(2)}`;
}

/* ─── main component ─── */
export function MenuEditor({ restaurantId }: { restaurantId: string }) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [modGroups, setModGroups] = useState<ModGroup[]>([]);
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const res = await fetch(`/api/restaurants/${restaurantId}/menu`);
    const d = await res.json();
    setMenus(d.menus ?? []);
    setCategories(d.categories ?? []);
    setItems(d.items ?? []);
    setModGroups(d.modifierGroups ?? []);
    setModifiers(d.modifiers ?? []);
    setLoading(false);
  }, [restaurantId]);

  useEffect(() => { load(); }, [load]);

  async function mutate(action: string, data?: Record<string, unknown>, id?: string) {
    const res = await fetch(`/api/restaurants/${restaurantId}/menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, data, id }),
    });
    return res.json();
  }

  /* ─── ensure a default menu exists ─── */
  async function ensureMenu(): Promise<string> {
    if (menus.length > 0) return menus[0].id;
    const m = await mutate("create_menu", { name: "Main Menu" });
    setMenus([m]);
    return m.id;
  }

  /* ─── category CRUD ─── */
  async function addCategory() {
    const menuId = await ensureMenu();
    const cat = await mutate("create_category", { menu_id: menuId, name: "New Category", sort_order: categories.length });
    setCategories((c) => [...c, cat]);
    setExpandedCats((s) => new Set(s).add(cat.id));
  }

  async function updateCategory(id: string, data: Partial<Category>) {
    const row = await mutate("update_category", data, id);
    setCategories((c) => c.map((x) => (x.id === id ? row : x)));
  }

  async function deleteCategory(id: string) {
    await mutate("delete_category", undefined, id);
    setCategories((c) => c.filter((x) => x.id !== id));
    setItems((i) => i.filter((x) => x.category_id !== id));
  }

  /* ─── item CRUD ─── */
  async function addItem(categoryId: string) {
    const catItems = items.filter((i) => i.category_id === categoryId);
    const row = await mutate("create_item", { category_id: categoryId, name: "New Item", price: 0, sort_order: catItems.length });
    setItems((i) => [...i, row]);
    setExpandedItems((s) => new Set(s).add(row.id));
  }

  async function updateItem(id: string, data: Partial<Item>) {
    const row = await mutate("update_item", data, id);
    setItems((i) => i.map((x) => (x.id === id ? row : x)));
  }

  async function deleteItem(id: string) {
    await mutate("delete_item", undefined, id);
    setItems((i) => i.filter((x) => x.id !== id));
    setModGroups((g) => g.filter((x) => x.menu_item_id !== id));
  }

  /* ─── modifier group CRUD ─── */
  async function addModGroup(itemId: string) {
    const row = await mutate("create_modifier_group", { menu_item_id: itemId, name: "New Group", sort_order: modGroups.filter((g) => g.menu_item_id === itemId).length });
    setModGroups((g) => [...g, row]);
  }

  async function updateModGroup(id: string, data: Partial<ModGroup>) {
    const row = await mutate("update_modifier_group", data, id);
    setModGroups((g) => g.map((x) => (x.id === id ? row : x)));
  }

  async function deleteModGroup(id: string) {
    await mutate("delete_modifier_group", undefined, id);
    setModGroups((g) => g.filter((x) => x.id !== id));
    setModifiers((m) => m.filter((x) => x.modifier_group_id !== id));
  }

  /* ─── modifier CRUD ─── */
  async function addModifier(groupId: string) {
    const row = await mutate("create_modifier", { modifier_group_id: groupId, name: "New Option", price: 0, sort_order: modifiers.filter((m) => m.modifier_group_id === groupId).length });
    setModifiers((m) => [...m, row]);
  }

  async function updateModifier(id: string, data: Partial<Modifier>) {
    const row = await mutate("update_modifier", data, id);
    setModifiers((m) => m.map((x) => (x.id === id ? row : x)));
  }

  async function deleteModifier(id: string) {
    await mutate("delete_modifier", undefined, id);
    setModifiers((m) => m.filter((x) => x.id !== id));
  }

  /* ─── toggle helpers ─── */
  function toggleCat(id: string) {
    setExpandedCats((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleItem(id: string) {
    setExpandedItems((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  if (loading) return <p className="text-sm text-muted-foreground py-4">Loading menu...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">{menus[0]?.name || "Menu"}</h3>
          <p className="text-xs text-muted-foreground">{categories.length} categories · {items.length} items</p>
        </div>
        <div className="flex gap-2">
          <ImportDialog restaurantId={restaurantId} onImported={load} />
          <Button size="sm" onClick={addCategory}><Plus className="mr-1 h-3.5 w-3.5" />Add Category</Button>
        </div>
      </div>

      {categories.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">No categories yet. Add a category or import a menu.</p>
      )}

      {categories.sort((a, b) => a.sort_order - b.sort_order).map((cat) => {
        const catItems = items.filter((i) => i.category_id === cat.id).sort((a, b) => a.sort_order - b.sort_order);
        const isExpanded = expandedCats.has(cat.id);

        return (
          <div key={cat.id} className="rounded-lg border">
            {/* Category header */}
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 cursor-pointer" onClick={() => toggleCat(cat.id)}>
              <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
              <EditableText value={cat.name} onSave={(v) => updateCategory(cat.id, { name: v })} className="font-medium text-sm flex-1" />
              <Badge variant="secondary" className="text-xs">{catItems.length} items</Badge>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>

            {/* Items list */}
            {isExpanded && (
              <div className="divide-y">
                {catItems.map((item) => {
                  const itemExpanded = expandedItems.has(item.id);
                  const itemGroups = modGroups.filter((g) => g.menu_item_id === item.id).sort((a, b) => a.sort_order - b.sort_order);

                  return (
                    <div key={item.id}>
                      {/* Item row */}
                      <div className="flex items-center gap-3 px-4 py-2 hover:bg-muted/20">
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                        <button onClick={() => toggleItem(item.id)} className="shrink-0">
                          {itemExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <EditableText value={item.name} onSave={(v) => updateItem(item.id, { name: v })} className="text-sm font-medium" />
                        </div>
                        <EditablePrice value={item.price} onSave={(v) => updateItem(item.id, { price: v })} />
                        <div className="flex items-center gap-1">
                          <Switch checked={item.is_available} onCheckedChange={(c) => updateItem(item.id, { is_available: c })} size="sm" />
                          <span className="text-xs text-muted-foreground w-16">{item.is_available ? "Available" : "Unavail."}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => deleteItem(item.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>

                      {/* Item expanded detail */}
                      {itemExpanded && (
                        <div className="px-8 pb-3 space-y-3 bg-muted/10">
                          <div className="grid gap-3 sm:grid-cols-2 pt-2">
                            <div className="sm:col-span-2">
                              <Label className="text-xs">Description</Label>
                              <Textarea
                                defaultValue={item.description ?? ""}
                                rows={2}
                                className="text-xs mt-1"
                                onBlur={(e) => { if (e.target.value !== (item.description ?? "")) updateItem(item.id, { description: e.target.value || null }); }}
                              />
                            </div>
                          </div>

                          {/* Modifier groups */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Modifier Groups</span>
                              <Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => addModGroup(item.id)}>
                                <Plus className="mr-1 h-3 w-3" />Add Group
                              </Button>
                            </div>

                            {itemGroups.length === 0 && (
                              <p className="text-xs text-muted-foreground">No modifier groups. Add one to let customers customize this item.</p>
                            )}

                            {itemGroups.map((group) => {
                              const groupMods = modifiers.filter((m) => m.modifier_group_id === group.id).sort((a, b) => a.sort_order - b.sort_order);
                              return (
                                <div key={group.id} className="rounded-md border bg-background p-3 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <EditableText value={group.name} onSave={(v) => updateModGroup(group.id, { name: v })} className="text-sm font-medium flex-1" />
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <label className="flex items-center gap-1">
                                        <input type="checkbox" checked={group.is_required} onChange={(e) => updateModGroup(group.id, { is_required: e.target.checked })} className="h-3 w-3 rounded" />
                                        Required
                                      </label>
                                      <span>Min: </span>
                                      <input
                                        type="number"
                                        value={group.min_selections}
                                        onChange={(e) => updateModGroup(group.id, { min_selections: parseInt(e.target.value) || 0 })}
                                        className="w-10 h-5 text-xs border rounded px-1 bg-transparent"
                                        min={0}
                                      />
                                      <span>Max: </span>
                                      <input
                                        type="number"
                                        value={group.max_selections}
                                        onChange={(e) => updateModGroup(group.id, { max_selections: parseInt(e.target.value) || 1 })}
                                        className="w-10 h-5 text-xs border rounded px-1 bg-transparent"
                                        min={1}
                                      />
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => deleteModGroup(group.id)}>
                                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                                    </Button>
                                  </div>
                                  <Separator />
                                  {groupMods.map((mod) => (
                                    <div key={mod.id} className="flex items-center gap-2 pl-2">
                                      <EditableText value={mod.name} onSave={(v) => updateModifier(mod.id, { name: v })} className="text-xs flex-1" />
                                      <EditablePrice value={mod.price} onSave={(v) => updateModifier(mod.id, { price: v })} small />
                                      <label className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <input type="checkbox" checked={mod.is_default} onChange={(e) => updateModifier(mod.id, { is_default: e.target.checked })} className="h-3 w-3 rounded" />
                                        Default
                                      </label>
                                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => deleteModifier(mod.id)}>
                                        <X className="h-3 w-3 text-muted-foreground" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button variant="ghost" size="sm" className="h-6 text-xs w-full" onClick={() => addModifier(group.id)}>
                                    <Plus className="mr-1 h-3 w-3" />Add Option
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add item button */}
                <div className="px-4 py-2">
                  <Button variant="ghost" size="sm" className="h-7 text-xs w-full" onClick={() => addItem(cat.id)}>
                    <Plus className="mr-1 h-3.5 w-3.5" />Add Item
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Inline editable text ─── */
function EditableText({ value, onSave, className }: { value: string; onSave: (v: string) => void; className?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  if (!editing) {
    return (
      <span
        className={`cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 ${className ?? ""}`}
        onClick={(e) => { e.stopPropagation(); setEditing(true); }}
        title="Click to edit"
      >
        {value || <span className="text-muted-foreground italic">Click to edit</span>}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="h-6 text-xs px-1"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") { onSave(draft); setEditing(false); }
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        onBlur={() => { if (draft !== value) onSave(draft); setEditing(false); }}
      />
    </div>
  );
}

/* ─── Inline editable price ─── */
function EditablePrice({ value, onSave, small }: { value: number; onSave: (v: number) => void; small?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value.toFixed(2));

  useEffect(() => { setDraft(value.toFixed(2)); }, [value]);

  if (!editing) {
    return (
      <span
        className={`cursor-pointer hover:bg-muted/50 rounded px-1 font-mono ${small ? "text-xs" : "text-sm"} tabular-nums`}
        onClick={(e) => { e.stopPropagation(); setEditing(true); }}
        title="Click to edit price"
      >
        {fmt(value)}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
      <span className="text-xs text-muted-foreground">$</span>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className={`${small ? "w-14 h-5 text-xs" : "w-16 h-6 text-xs"} px-1 font-mono`}
        type="number"
        step="0.01"
        min="0"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") { onSave(parseFloat(draft) || 0); setEditing(false); }
          if (e.key === "Escape") { setDraft(value.toFixed(2)); setEditing(false); }
        }}
        onBlur={() => { const n = parseFloat(draft) || 0; if (n !== value) onSave(n); setEditing(false); }}
      />
    </div>
  );
}

/* ─── JSON Import dialog (kept from before) ─── */
function ImportDialog({ restaurantId, onImported }: { restaurantId: string; onImported: () => void }) {
  const [open, setOpen] = useState(false);
  const [json, setJson] = useState("");
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleImport() {
    setImporting(true);
    setMsg("");
    try {
      const parsed = JSON.parse(json);
      const res = await fetch(`/api/restaurants/${restaurantId}/menu-import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (res.ok) {
        setMsg("Imported!");
        setJson("");
        onImported();
        setTimeout(() => setOpen(false), 1000);
      } else {
        const d = await res.json();
        setMsg(d.error || "Import failed");
      }
    } catch {
      setMsg("Invalid JSON");
    }
    setImporting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Upload className="mr-1 h-3.5 w-3.5" />Import JSON
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Import Menu from JSON</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Paste JSON: name, categories[].name, categories[].items[].name/price, optional modifier_groups[].modifiers[].
          </p>
          <Textarea value={json} onChange={(e) => setJson(e.target.value)} rows={10} className="font-mono text-xs" />
          {msg && <p className={`text-sm ${msg === "Imported!" ? "text-green-600" : "text-destructive"}`}>{msg}</p>}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleImport} disabled={importing || !json.trim()}>{importing ? "Importing..." : "Import"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
