"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Plus, Tag } from "lucide-react";
import type { Database } from "@/types/database";

type Promo = Database["public"]["Tables"]["promotions"]["Row"];

export default function PromotionsPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/promotions")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setPromos(d); })
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);

    const res = await fetch("/api/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: fd.get("code"),
        description: fd.get("description"),
        type: fd.get("type"),
        value: parseFloat(fd.get("value") as string) || 0,
        min_subtotal: parseFloat(fd.get("min_subtotal") as string) || null,
        max_discount: parseFloat(fd.get("max_discount") as string) || null,
        usage_limit: parseInt(fd.get("usage_limit") as string) || null,
        expires_at: fd.get("expires_at") || null,
      }),
    });

    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "Failed"); return; }
    setPromos((p) => [data, ...p]);
    setOpen(false);
  }

  async function toggleActive(promo: Promo) {
    const res = await fetch(`/api/promotions/${promo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !promo.is_active }),
    });
    const data = await res.json();
    if (data.id) setPromos((p) => p.map((x) => (x.id === data.id ? data : x)));
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Promotions" description="Create and manage promo codes">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" />Create Promo Code
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Create Promo Code</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input id="code" name="code" required placeholder="SUMMER25" className="uppercase" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" placeholder="25% off summer orders" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select id="type" name="type" defaultValue="percentage" className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value *</Label>
                  <Input id="value" name="value" type="number" step="0.01" required placeholder="25" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_subtotal">Min Subtotal ($)</Label>
                  <Input id="min_subtotal" name="min_subtotal" type="number" step="0.01" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_discount">Max Discount ($)</Label>
                  <Input id="max_discount" name="max_discount" type="number" step="0.01" placeholder="No limit" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usage_limit">Usage Limit</Label>
                  <Input id="usage_limit" name="usage_limit" type="number" placeholder="Unlimited" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expires_at">Expires At</Label>
                  <Input id="expires_at" name="expires_at" type="date" />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
                <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card>
        <CardHeader><CardTitle className="text-base">All Promo Codes ({promos.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
          ) : promos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
                <Tag className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium">No promo codes yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">Click "Create Promo Code" to create your first promotion.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono font-medium">{p.code}</TableCell>
                    <TableCell className="capitalize">{p.type}</TableCell>
                    <TableCell>{p.type === "percentage" ? `${p.value}%` : `$${p.value.toFixed(2)}`}</TableCell>
                    <TableCell>{p.usage_count}{p.usage_limit ? ` / ${p.usage_limit}` : ""}</TableCell>
                    <TableCell>
                      <Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
