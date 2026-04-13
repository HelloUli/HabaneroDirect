import { auth } from "@/lib/auth";

export interface RestaurantSession {
  userId: string;
  restaurantId: string;
  role: "owner" | "staff";
  name: string;
  email: string;
}

export async function getRestaurantSession(): Promise<RestaurantSession | null> {
  const session = await auth();
  if (!session?.user) return null;

  const user = session.user as Record<string, unknown>;
  if (!user.restaurantId) return null;

  return {
    userId: user.id as string,
    restaurantId: user.restaurantId as string,
    role: user.role as "owner" | "staff",
    name: (user.name as string) ?? "",
    email: (user.email as string) ?? "",
  };
}
