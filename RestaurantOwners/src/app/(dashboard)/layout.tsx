import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as {
    id: string;
    name: string;
    role: string;
    restaurantId: string;
  };

  let restaurantName = "";
  try {
    const supabase = createServiceRoleClient();
    const { data } = await supabase
      .from("restaurants")
      .select("name")
      .eq("id", user.restaurantId)
      .single();
    restaurantName = data?.name ?? "";
  } catch {
    // fallback
  }

  return (
    <div className="flex h-full">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header role={user.role} />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-4 lg:p-6">
          <div className="mb-1 text-xs font-medium text-muted-foreground lg:hidden">
            {restaurantName}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
