"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import Image from "next/image";
import { Plus, Store, ExternalLink, Copy, Upload, ImageIcon, X } from "lucide-react";
import type { Database } from "@/types/database";

type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];

export default function RestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    fetch("/api/restaurants")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setRestaurants(d); })
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);

    const res = await fetch("/api/restaurants", {
      method: "POST",
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
        commission_rate: parseFloat(fd.get("commission_rate") as string) / 100 || 0.1,
        has_website_subscription: fd.get("has_website_subscription") === "on",
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Failed to create restaurant");
      return;
    }

    setRestaurants((prev) => [data, ...prev]);
    setLogoUrl(null);
    setOpen(false);
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

  function copyLink(slug: string) {
    navigator.clipboard.writeText(`${window.location.origin}/order/${slug}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Restaurants" description="Manage restaurants on the platform">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" />Add Restaurant
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Restaurant</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <Input id="name" name="name" required placeholder="Taco Palace" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Brief description..." rows={2} />
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
                  <Input id="address" name="address" placeholder="123 Main St" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" placeholder="Austin" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" placeholder="TX" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP</Label>
                    <Input id="zip" name="zip" placeholder="78701" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="(512) 555-0100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="info@restaurant.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input id="commission_rate" name="commission_rate" type="number" step="0.1" defaultValue="10" min="0" max="100" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input id="has_website_subscription" name="has_website_subscription" type="checkbox" className="h-4 w-4 rounded border-input" />
                  <Label htmlFor="has_website_subscription" className="text-sm font-normal">Website subscription (5% rate)</Label>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
                <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create Restaurant"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Restaurants</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
          ) : restaurants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
                <Store className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium">No restaurants yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Click "Add Restaurant" to onboard your first restaurant.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stripe</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {restaurants.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => router.push(`/restaurants/${r.id}`)}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{r.slug}</TableCell>
                    <TableCell>{(r.commission_rate * 100).toFixed(1)}%</TableCell>
                    <TableCell>
                      <Badge variant={r.is_active ? "default" : "secondary"}>
                        {r.is_active ? (r.is_open ? "Open" : "Closed") : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.stripe_onboarding_complete ? "default" : "outline"}>
                        {r.stripe_onboarding_complete ? "Connected" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => copyLink(r.slug)} title="Copy ordering link">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" render={<a href={`/order/${r.slug}`} target="_blank" rel="noopener noreferrer" title="Open ordering page" />}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
