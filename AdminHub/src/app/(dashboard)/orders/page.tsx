import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="View and manage all platform orders"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
              <ShoppingCart className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">No orders yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Orders will appear here once customers begin placing orders. You can filter by status, restaurant, and date range.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
