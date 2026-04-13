"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  UtensilsCrossed,
  Store,
  BarChart3,
  History,
  Settings,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  ownerOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Live Orders", href: "/orders", icon: ClipboardList },
  { label: "Order History", href: "/orders/history", icon: History },
  { label: "Menu", href: "/menu", icon: UtensilsCrossed, ownerOnly: true },
  { label: "Store", href: "/store", icon: Store, ownerOnly: true },
  { label: "Reports", href: "/reports", icon: BarChart3, ownerOnly: true },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const visibleItems = navItems.filter(
    (item) => !item.ownerOnly || role === "owner"
  );

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-sidebar lg:text-sidebar-foreground">
      <div className="flex h-14 items-center border-b px-4">
        <Image
          src="/logo.png"
          alt="Habanero Direct"
          width={200}
          height={44}
          className="h-10 w-auto object-contain"
          priority
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
