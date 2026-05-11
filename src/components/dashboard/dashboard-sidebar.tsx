"use client";

import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarNav, getRoleBadgeProps } from "./sidebar-nav";
import type { SafeUser } from "@/types";

export function DashboardSidebar({ user }: { user: SafeUser }) {
  const roleBadge = getRoleBadgeProps(user.role);
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:border-r lg:border-border/40 lg:bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5 border-b border-border/40">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-orange to-amber-500 shadow-sm shadow-brand-orange/20">
            <UtensilsCrossed className="size-4 text-white" />
          </div>
          <span className="text-lg font-bold font-heading text-brand-dark">
            Chop<span className="text-brand-orange">Wise</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <SidebarNav role={user.role as "CLIENT" | "RESTAURANT_OWNER" | "ADMIN"} />
      </ScrollArea>

      {/* User footer */}
      <div className="border-t border-border/40 px-4 py-3">
        <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/80 transition-colors">
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="h-9 w-9 rounded-full object-cover shrink-0" />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-amber-500 text-white text-xs font-bold">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
            <span className={`inline-block text-[10px] font-semibold ${roleBadge.className} px-1.5 py-px rounded-full mt-0.5`}>
              {roleBadge.label}
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
