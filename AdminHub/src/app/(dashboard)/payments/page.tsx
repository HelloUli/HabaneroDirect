"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, AlertCircle } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  commission_rate: number;
}

export default function PaymentsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/restaurants")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setRestaurants(d); })
      .finally(() => setLoading(false));
  }, []);

  const connected = restaurants.filter((r) => r.stripe_onboarding_complete).length;
  const pending = restaurants.filter((r) => !r.stripe_onboarding_complete).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Stripe Connect integration and payout management" />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Restaurants</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{loading ? "..." : restaurants.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stripe Connected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{loading ? "..." : connected}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Setup</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{loading ? "..." : pending}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Restaurant Payment Status</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-4">Loading...</p>
          ) : restaurants.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No restaurants yet. Add restaurants to manage their Stripe Connect accounts.
            </p>
          ) : (
            <div className="space-y-3">
              {restaurants.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">Commission: {(r.commission_rate * 100).toFixed(1)}%</p>
                  </div>
                  <Badge variant={r.stripe_onboarding_complete ? "default" : "outline"}>
                    {r.stripe_onboarding_complete ? "Connected" : "Not Connected"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
