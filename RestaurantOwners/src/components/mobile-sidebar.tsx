"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  ClipboardList,
  UtensilsCrossed,
  Store,
  BarChart3,
  History,
  Settings,
  Menu,
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

export function MobileSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const visibleItems = navItems.filter(
    (item) => !item.ownerOnly || role === "owner"
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="lg:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-accent cursor-pointer">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-14 items-center border-b px-4">
          <Image
            src="/logo.png"
            alt="Habanero Direct"
            width={200}
            height={200}
            className="h-10 w-auto object-contain"
            unoptimized
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
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
