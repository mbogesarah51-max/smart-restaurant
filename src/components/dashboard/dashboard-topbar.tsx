"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Bell,
  Search,
  Menu,
  LogOut,
  Settings,
  UtensilsCrossed,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";
import { MobileSidebarNav, getRoleBadgeProps } from "./sidebar-nav";
import type { SafeUser } from "@/types";

function UserAvatar({ initials, src, size = "sm" }: { initials: string; src?: string | null; size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-8 w-8 text-[11px]" : "h-9 w-9 text-xs";
  if (src) {
    return (
      <img src={src} alt="Profile" className={`${s} rounded-full object-cover shrink-0`} />
    );
  }
  return (
    <div className={`flex ${s} shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-amber-500 text-white font-bold`}>
      {initials}
    </div>
  );
}

export function DashboardTopbar({ user }: { user: SafeUser }) {
  const router = useRouter();
  const clerk = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const roleBadge = getRoleBadgeProps(user.role);
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await clerk.signOut();
      router.push("/sign-in");
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/40 bg-white/80 backdrop-blur-xl px-4 lg:px-6">
      {/* Mobile menu trigger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon-sm" className="lg:hidden shrink-0" />
          }
        >
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0" showCloseButton={false}>
          {/* Mobile header with logo + close */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-orange to-amber-500">
                <UtensilsCrossed className="size-4 text-white" />
              </div>
              <span className="text-base font-bold font-heading text-brand-dark">
                Chop<span className="text-brand-orange">Wise</span>
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <Separator className="my-2" />

          {/* Mobile user info */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <UserAvatar initials={initials} src={user.profileImage} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <Separator className="my-1" />

          {/* Mobile nav */}
          <div className="flex-1 py-2">
            <MobileSidebarNav
              role={user.role as "CLIENT" | "RESTAURANT_OWNER" | "ADMIN"}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>

          <Separator />

          {/* Mobile sign out */}
          <div className="p-3">
            <button
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => {
                setMobileOpen(false);
                handleSignOut();
              }}
              disabled={signingOut}
            >
              {signingOut ? <Loader2 className="size-[18px] animate-spin" /> : <LogOut className="size-[18px]" />}
              Sign out
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Center: Search */}
      <div className="flex-1 max-w-sm hidden md:block mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 h-8 bg-muted/40 border-transparent rounded-lg text-sm focus:bg-white focus:border-input"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Search icon on mobile */}
        <Button variant="ghost" size="icon-sm" className="md:hidden shrink-0">
          <Search className="size-4 text-muted-foreground" />
        </Button>

        {/* Notification bell */}
        <Button variant="ghost" size="icon-sm" className="relative shrink-0">
          <Bell className="size-4 text-muted-foreground" />
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-brand-orange ring-2 ring-white" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-border/60 mx-1" />

        {/* User dropdown - custom implementation */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg hover:bg-muted/80 transition-colors"
          >
            <UserAvatar initials={initials} src={user.profileImage} />
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-[13px] font-semibold text-foreground leading-tight">{user.name}</span>
              <span className={`text-[10px] font-semibold leading-tight ${roleBadge.className} px-1.5 py-px rounded-full mt-0.5`}>
                {roleBadge.label}
              </span>
            </div>
            <ChevronDown className={`size-3.5 text-muted-foreground hidden sm:block transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-lg bg-white border border-border/60 shadow-lg py-1 animate-in fade-in-0 zoom-in-95">
                <div className="px-3 py-2.5 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <UserAvatar initials={initials} src={user.profileImage} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted/80 transition-colors"
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push("/dashboard/settings");
                    }}
                  >
                    <Settings className="size-4 text-muted-foreground" />
                    Settings
                  </button>
                </div>
                <div className="border-t border-border/40 py-1">
                  <button
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleSignOut();
                    }}
                    disabled={signingOut}
                  >
                    {signingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
