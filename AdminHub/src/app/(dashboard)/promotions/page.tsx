import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Tag } from "lucide-react";

export default function PromotionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotions"
        description="Create and manage promo codes"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Promo Code
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Promo Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
              <Tag className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">No promo codes yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Create promo codes with fixed or percentage discounts, minimum subtotals, expiration dates, and usage limits.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
