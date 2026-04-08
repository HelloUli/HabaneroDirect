import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Store } from "lucide-react";

export default function RestaurantsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurants"
        description="Manage restaurants on the platform"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Restaurant
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Restaurants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
              <Store className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">No restaurants yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Create your first restaurant to generate ordering links, embed buttons, and configure commission rates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
