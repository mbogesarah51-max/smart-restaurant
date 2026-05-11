"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  CalendarCheck,
  Bot,
  Settings,
  Store,
  BookOpen,
  UtensilsCrossed,
  Users,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const clientNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Explore Restaurants", href: "/dashboard/explore", icon: Search },
  { label: "My Reservations", href: "/dashboard/reservations", icon: CalendarCheck },
  { label: "AI Recommend", href: "/dashboard/ai-recommend", icon: Bot },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const ownerNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/restaurant", icon: LayoutDashboard },
  { label: "My Restaurant", href: "/dashboard/restaurant/edit", icon: Store },
  { label: "Reservations", href: "/dashboard/restaurant/reservations", icon: CalendarCheck },
  { label: "Menu Management", href: "/dashboard/restaurant/menu", icon: BookOpen },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Restaurants", href: "/dashboard/admin/restaurants", icon: UtensilsCrossed },
  { label: "Users", href: "/dashboard/admin/users", icon: Users },
  { label: "Reservations", href: "/dashboard/admin/reservations", icon: CalendarCheck },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const navMap = {
  CLIENT: clientNav,
  RESTAURANT_OWNER: ownerNav,
  ADMIN: adminNav,
} as const;

function isActive(pathname: string, href: string, role: string): boolean {
  if (href === "/dashboard" && role === "CLIENT") return pathname === "/dashboard";
  if (href === "/dashboard/restaurant" && role === "RESTAURANT_OWNER") return pathname === "/dashboard/restaurant";
  if (href === "/dashboard/admin" && role === "ADMIN") return pathname === "/dashboard/admin";
  return pathname.startsWith(href) && href !== "/dashboard" && href !== "/dashboard/restaurant" && href !== "/dashboard/admin";
}

export function SidebarNav({
  role,
  collapsed = false,
}: {
  role: "CLIENT" | "RESTAURANT_OWNER" | "ADMIN";
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const items = navMap[role];

  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {items.map((item) => {
        const active = isActive(pathname, item.href, role);
        const linkContent = (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
              active
                ? "bg-brand-orange/10 text-brand-orange"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              collapsed && "justify-center px-2.5"
            )}
          >
            <item.icon className={cn("shrink-0", collapsed ? "size-5" : "size-[18px]")} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );

        if (collapsed) {
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger render={linkContent} />
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        }

        return linkContent;
      })}
    </nav>
  );
}

export function MobileSidebarNav({
  role,
  onNavigate,
}: {
  role: "CLIENT" | "RESTAURANT_OWNER" | "ADMIN";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = navMap[role];

  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {items.map((item) => {
        const active = isActive(pathname, item.href, role);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
              active
                ? "bg-brand-orange/10 text-brand-orange"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            <item.icon className="size-[18px] shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function getRoleBadgeProps(role: string) {
  switch (role) {
    case "RESTAURANT_OWNER":
      return { label: "Owner", className: "bg-emerald-100 text-emerald-700", icon: Store };
    case "ADMIN":
      return { label: "Admin", className: "bg-purple-100 text-purple-700", icon: ShieldCheck };
    default:
      return { label: "Diner", className: "bg-orange-100 text-brand-orange", icon: UtensilsCrossed };
  }
}
