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
// Dialog imports removed — MenuEditor handles its own dialogs
import Image from "next/image";
import { ArrowLeft, Copy, Code, Upload, ImageIcon, X } from "lucide-react";
import { MenuEditor } from "@/components/menu-editor";
import type { Database } from "@/types/database";

type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.id) { setRestaurant(d); setLogoUrl(d.logo_url); } })
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
        logo_url: logoUrl,
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

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json();
    setLogoUploading(false);
    if (data.url) setLogoUrl(data.url);
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
                    <Label>Logo</Label>
                    <div className="flex items-start gap-4">
                      {logoUrl ? (
                        <div className="relative h-16 w-16 shrink-0 rounded-lg border overflow-hidden bg-muted">
                          <Image src={logoUrl} alt="Logo" fill className="object-contain" />
                          <button
                            type="button"
                            onClick={() => setLogoUrl(null)}
                            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed bg-muted">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors">
                          <Upload className="h-4 w-4" />
                          {logoUploading ? "Uploading..." : "Upload PNG or JPG"}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            className="sr-only"
                            onChange={handleLogoUpload}
                            disabled={logoUploading}
                          />
                        </label>
                        <p className="text-xs text-muted-foreground">Max 2 MB</p>
                      </div>
                    </div>
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

          {/* Menu editor */}
          <Card>
            <CardHeader><CardTitle className="text-base">Menu</CardTitle></CardHeader>
            <CardContent>
              <MenuEditor restaurantId={id} />
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
