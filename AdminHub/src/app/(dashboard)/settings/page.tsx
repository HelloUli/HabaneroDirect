"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Pencil, Check, X } from "lucide-react";

interface Setting {
  id: string;
  key: string;
  value: string;
  type: string;
  label: string | null;
  description: string | null;
}

const fallbackSettings: Setting[] = [
  { id: "1", key: "delivery_fee", value: "4.99", type: "number", label: "Delivery Fee", description: "Default delivery fee charged to customers" },
  { id: "2", key: "tax_rate", value: "8.25", type: "number", label: "Tax Rate (%)", description: "Default sales tax percentage" },
  { id: "3", key: "platform_name", value: "Habanero Direct", type: "string", label: "Platform Name", description: "Display name for the platform" },
  { id: "4", key: "support_email", value: "support@habanero.direct", type: "string", label: "Support Email", description: "Customer-facing support email" },
  { id: "5", key: "min_order_amount", value: "10.00", type: "number", label: "Minimum Order Amount", description: "Minimum subtotal required to place an order" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) {
          setSettings(d);
        } else {
          setSettings(fallbackSettings);
          setUsingFallback(true);
        }
      })
      .catch(() => {
        setSettings(fallbackSettings);
        setUsingFallback(true);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(key: string) {
    if (usingFallback) {
      setSettings((s) => s.map((x) => (x.key === key ? { ...x, value: editValue } : x)));
      setEditKey(null);
      return;
    }

    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: editValue }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.id) {
      setSettings((s) => s.map((x) => (x.key === key ? data : x)));
    }
    setEditKey(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Settings" description="Global configuration for the Habanero Direct platform">
        <Badge variant="outline" className="text-xs">Super Admin Only</Badge>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Global Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {loading ? (
            <p className="text-sm text-muted-foreground py-4">Loading...</p>
          ) : (
            settings.map((s, i) => (
              <div key={s.key}>
                {i > 0 && <Separator className="my-4" />}
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{s.label || s.key}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                  </div>
                  {editKey === s.key ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-40 h-8 text-sm"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") handleSave(s.key); if (e.key === "Escape") setEditKey(null); }}
                      />
                      <Button size="sm" variant="ghost" onClick={() => handleSave(s.key)} disabled={saving}>
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditKey(null)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {s.type === "number" && s.key !== "tax_rate" ? `$${s.value}` : s.key === "tax_rate" ? `${s.value}%` : s.value}
                      </Badge>
                      <Button size="sm" variant="ghost" onClick={() => { setEditKey(s.key); setEditValue(s.value); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {usingFallback && (
            <>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">
                Using default values. Create the platform_settings table in Supabase to persist changes.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
