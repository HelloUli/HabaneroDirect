"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Mail, Clock, CreditCard } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  timezone: string;
  is_active: boolean;
  is_open: boolean;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  commission_rate: number;
  has_website_subscription: boolean;
  operating_hours: Record<string, unknown> | null;
}

export default function StorePage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetch("/api/restaurant")
      .then((r) => r.json())
      .then((d) => { if (d.id) setRestaurant(d); })
      .finally(() => setLoading(false));
  }, []);

  async function toggleOpen() {
    if (!restaurant || toggling) return;
    setToggling(true);
    const res = await fetch("/api/restaurant", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_open: !restaurant.is_open }),
    });
    const data = await res.json();
    if (data.id) setRestaurant(data);
    setToggling(false);
  }

  if (loading) return <p className="text-sm text-muted-foreground p-8">Loading...</p>;
  if (!restaurant) return <p className="text-sm text-destructive p-8">Restaurant not found.</p>;

  const commissionPercent = (Number(restaurant.commission_rate) * 100).toFixed(1);
  const fullAddress = [restaurant.address, restaurant.city, restaurant.state, restaurant.zip].filter(Boolean).join(", ");

  return (
    <div className="space-y-6">
      <PageHeader title="Store Controls" description="Manage your store status and view your restaurant details" />

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Restaurant Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Restaurant Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</p>
                  <p className="text-sm font-medium mt-1">{restaurant.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Slug</p>
                  <p className="text-sm font-mono mt-1">/{restaurant.slug}</p>
                </div>
                {restaurant.description && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</p>
                    <p className="text-sm mt-1">{restaurant.description}</p>
                  </div>
                )}
                {fullAddress && (
                  <div className="sm:col-span-2 flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-sm">{fullAddress}</p>
                  </div>
                )}
                {restaurant.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-sm">{restaurant.phone}</p>
                  </div>
                )}
                {restaurant.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-sm">{restaurant.email}</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                To update your restaurant details, contact Habanero Direct.
              </p>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Operating Hours</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <HoursDisplay hours={restaurant.operating_hours} />
            </CardContent>
          </Card>
        </div>

        {/* Right column: status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Store Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Accepting Orders</span>
                <Switch
                  checked={restaurant.is_open}
                  onCheckedChange={toggleOpen}
                  disabled={toggling}
                />
              </div>
              <Badge
                variant={restaurant.is_open ? "default" : "secondary"}
                className="w-full justify-center py-1.5"
              >
                {restaurant.is_open ? "Open — Accepting Orders" : "Closed — Not Accepting Orders"}
              </Badge>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm">Platform Active</span>
                <Badge variant={restaurant.is_active ? "default" : "outline"}>
                  {restaurant.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Payment Structure</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Commission Rate</span>
                <Badge variant="secondary" className="text-sm font-mono">{commissionPercent}%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Website Subscription</span>
                <Badge variant={restaurant.has_website_subscription ? "default" : "outline"}>
                  {restaurant.has_website_subscription ? "Active" : "None"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Stripe</span>
                <Badge variant={restaurant.stripe_onboarding_complete ? "default" : "outline"}>
                  {restaurant.stripe_onboarding_complete ? "Connected" : "Not Connected"}
                </Badge>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                {restaurant.has_website_subscription
                  ? "5% commission rate applies with website subscription."
                  : "10% standard commission rate. Get a website subscription to reduce to 5%."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timezone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{restaurant.timezone}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function HoursDisplay({ hours }: { hours: Record<string, unknown> | null }) {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  if (!hours || Object.keys(hours).length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Operating hours have not been configured yet. Contact Habanero Direct to set up your hours.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {days.map((day) => {
        const dayData = hours[day] as { open?: string; close?: string; is_closed?: boolean } | undefined;
        return (
          <div key={day} className="flex items-center justify-between text-sm">
            <span className="capitalize font-medium w-24">{day}</span>
            {dayData?.is_closed ? (
              <span className="text-muted-foreground">Closed</span>
            ) : dayData?.open && dayData?.close ? (
              <span className="font-mono tabular-nums">{dayData.open} — {dayData.close}</span>
            ) : (
              <span className="text-muted-foreground">Not set</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
