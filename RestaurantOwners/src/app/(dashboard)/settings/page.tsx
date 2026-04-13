"use client";

import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Building } from "lucide-react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const user = session?.user;

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" description="View your account information" />
        <p className="text-sm text-muted-foreground">Loading account details…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="View your account information" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</p>
              <p className="text-sm font-medium mt-1">{user?.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
              <p className="text-sm mt-1">{user?.email || "—"}</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Role</span>
              </div>
              <Badge variant="secondary" className="capitalize">
                {(user as Record<string, unknown> | undefined)?.role as string || "—"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Restaurant</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Your account is linked to your restaurant through Habanero Direct.
              To update your restaurant information or account credentials, contact support.
            </p>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Support</p>
              <p className="text-sm mt-1">support@habanero.direct</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
