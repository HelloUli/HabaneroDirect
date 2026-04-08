import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Stripe Connect integration and payout management"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
              <CreditCard className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium">
              Stripe Connect Integration
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              This page will manage payment processing via Stripe, restaurant payouts through Stripe Connect, refund workflows, and full payment audit trails.
            </p>
            <div className="mt-6 grid gap-2 text-left text-sm text-muted-foreground">
              <p>Planned features:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Customer payment processing</li>
                <li>Platform commission calculation</li>
                <li>Restaurant payout management</li>
                <li>Refund workflow</li>
                <li>Payment audit log</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
