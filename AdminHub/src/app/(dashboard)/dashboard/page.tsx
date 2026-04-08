import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Store,
  ShoppingCart,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    title: "Total Restaurants",
    value: "—",
    description: "Connect database to see data",
    icon: Store,
  },
  {
    title: "Total Orders",
    value: "—",
    description: "All time",
    icon: ShoppingCart,
  },
  {
    title: "Revenue",
    value: "—",
    description: "All time gross",
    icon: DollarSign,
  },
  {
    title: "Commission Earned",
    value: "—",
    description: "Platform earnings",
    icon: TrendingUp,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of the Habanero Direct platform"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No orders yet. Orders will appear here once the database is connected and customers begin placing orders.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Restaurant Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No restaurant data yet. Add restaurants to see performance metrics.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
