"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { ArrowLeft, Copy, Code, Upload } from "lucide-react";
import type { Database } from "@/types/database";

type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuJson, setMenuJson] = useState("");
  const [menuImporting, setMenuImporting] = useState(false);
  const [menuMsg, setMenuMsg] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.id) setRestaurant(d); })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!restaurant) return;
    setSaving(true);
    const fd = new FormData(e.currentTarget);

    const res = await fetch(`/api/restaurants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        description: fd.get("description"),
        address: fd.get("address"),
        city: fd.get("city"),
        state: fd.get("state"),
        zip: fd.get("zip"),
        phone: fd.get("phone"),
        email: fd.get("email"),
        logo_url: fd.get("logo_url"),
        commission_rate: parseFloat(fd.get("commission_rate") as string) / 100 || restaurant.commission_rate,
      }),
    });

    const data = await res.json();
    setSaving(false);
    if (data.id) setRestaurant(data);
  }

  async function toggleOpen() {
    if (!restaurant) return;
    const res = await fetch(`/api/restaurants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_open: !restaurant.is_open }),
    });
    const data = await res.json();
    if (data.id) setRestaurant(data);
  }

  async function toggleActive() {
    if (!restaurant) return;
    const res = await fetch(`/api/restaurants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !restaurant.is_active }),
    });
    const data = await res.json();
    if (data.id) setRestaurant(data);
  }

  async function handleMenuImport() {
    setMenuImporting(true);
    setMenuMsg("");
    try {
      const parsed = JSON.parse(menuJson);
      const res = await fetch(`/api/restaurants/${id}/menu-import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (res.ok) {
        setMenuMsg("Menu imported successfully!");
        setMenuJson("");
        setTimeout(() => setMenuOpen(false), 1500);
      } else {
        setMenuMsg(data.error || "Import failed");
      }
    } catch {
      setMenuMsg("Invalid JSON format");
    }
    setMenuImporting(false);
  }

  const orderingLink = restaurant ? `${typeof window !== "undefined" ? window.location.origin : ""}/order/${restaurant.slug}` : "";
  const embedCode = restaurant
    ? `<a href="${orderingLink}" style="display:inline-block;padding:12px 24px;background:#E53935;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Order from ${restaurant.name}</a>`
    : "";

  if (loading) return <p className="text-sm text-muted-foreground p-8">Loading...</p>;
  if (!restaurant) return <p className="text-sm text-destructive p-8">Restaurant not found.</p>;

  return (
    <div className="space-y-6">
      <PageHeader title={restaurant.name} description={`/${restaurant.slug}`}>
        <Button variant="outline" size="sm" onClick={() => router.push("/restaurants")}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: edit form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Restaurant Details</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={restaurant.name} required />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" defaultValue={restaurant.description ?? ""} rows={2} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="logo_url">Logo URL</Label>
                    <Input id="logo_url" name="logo_url" defaultValue={restaurant.logo_url ?? ""} placeholder="https://..." />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" defaultValue={restaurant.address ?? ""} />
                  </div>
                  <div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" name="city" defaultValue={restaurant.city ?? ""} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2"><Label htmlFor="state">State</Label><Input id="state" name="state" defaultValue={restaurant.state ?? ""} /></div>
                    <div className="space-y-2"><Label htmlFor="zip">ZIP</Label><Input id="zip" name="zip" defaultValue={restaurant.zip ?? ""} /></div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" defaultValue={restaurant.phone ?? ""} /></div>
                  <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" defaultValue={restaurant.email ?? ""} /></div>
                  <div className="space-y-2">
                    <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                    <Input id="commission_rate" name="commission_rate" type="number" step="0.1" defaultValue={(restaurant.commission_rate * 100).toFixed(1)} />
                  </div>
                </div>
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              </form>
            </CardContent>
          </Card>

          {/* Menu import */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Menu
                <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
                  <DialogTrigger render={<Button size="sm" />}>
                    <Upload className="mr-2 h-3.5 w-3.5" />Import Menu JSON
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Import Menu from JSON</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        Paste a JSON object with: name, categories[].name, categories[].items[].name/price/description, and optional modifier_groups[].modifiers[].
                      </p>
                      <Textarea
                        value={menuJson}
                        onChange={(e) => setMenuJson(e.target.value)}
                        rows={12}
                        className="font-mono text-xs"
                        placeholder='{"name":"Main Menu","categories":[{"name":"Appetizers","items":[{"name":"Nachos","price":9.99}]}]}'
                      />
                      {menuMsg && <p className={`text-sm ${menuMsg.includes("success") ? "text-green-600" : "text-destructive"}`}>{menuMsg}</p>}
                    </div>
                    <DialogFooter>
                      <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                      <Button onClick={handleMenuImport} disabled={menuImporting || !menuJson.trim()}>
                        {menuImporting ? "Importing..." : "Import"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Use "Import Menu JSON" to add a full menu with categories, items, and modifiers.</p>
            </CardContent>
          </Card>
        </div>

        {/* Right column: status & links */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active</span>
                <Switch checked={restaurant.is_active} onCheckedChange={toggleActive} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Accepting Orders</span>
                <Switch checked={restaurant.is_open} onCheckedChange={toggleOpen} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm">Stripe</span>
                <Badge variant={restaurant.stripe_onboarding_complete ? "default" : "outline"}>
                  {restaurant.stripe_onboarding_complete ? "Connected" : "Not Connected"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Commission</span>
                <Badge variant="secondary">{(restaurant.commission_rate * 100).toFixed(1)}%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Ordering Link</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Input value={orderingLink} readOnly className="text-xs font-mono" />
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(orderingLink)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Embed Button</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea value={embedCode} readOnly className="text-xs font-mono" rows={3} />
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigator.clipboard.writeText(embedCode)}>
                <Code className="mr-2 h-3.5 w-3.5" />Copy Embed Code
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
