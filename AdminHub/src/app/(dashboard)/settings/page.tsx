import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";

const defaultSettings = [
  {
    key: "delivery_fee",
    label: "Delivery Fee",
    value: "$4.99",
    description: "Default delivery fee charged to customers",
  },
  {
    key: "tax_rate",
    label: "Tax Rate",
    value: "8.25%",
    description: "Default sales tax percentage",
  },
  {
    key: "platform_name",
    label: "Platform Name",
    value: "Habanero Direct",
    description: "Display name for the platform",
  },
  {
    key: "support_email",
    label: "Support Email",
    value: "support@habanero.direct",
    description: "Customer-facing support email",
  },
  {
    key: "min_order_amount",
    label: "Minimum Order Amount",
    value: "$10.00",
    description: "Minimum subtotal required to place an order",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Settings"
        description="Global configuration for the Habanero Direct platform"
      >
        <Badge variant="outline" className="text-xs">
          Super Admin Only
        </Badge>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Global Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {defaultSettings.map((setting, i) => (
            <div key={setting.key}>
              {i > 0 && <Separator className="my-4" />}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{setting.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {setting.description}
                  </p>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {setting.value}
                </Badge>
              </div>
            </div>
          ))}
          <Separator className="my-4" />
          <p className="text-xs text-muted-foreground">
            Editing will be enabled once the database is connected. Settings are stored in the platform_settings table.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
