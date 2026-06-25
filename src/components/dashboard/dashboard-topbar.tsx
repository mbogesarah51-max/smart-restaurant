"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  AlertCircle,
  Bell,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Loader2,
  LogOut,
  Menu,
  Search,
  Settings,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileSidebarNav, getRoleBadgeProps } from "./sidebar-nav";
import type { SafeUser } from "@/types";
import type { DinerNotification } from "@/app/actions/notifications";

function UserAvatar({ initials, src, size = "sm" }: { initials: string; src?: string | null; size?: "sm" | "md" }) {
  const dimension = size === "sm" ? "h-8 w-8 text-[11px]" : "h-9 w-9 text-xs";
  if (src) {
    return <img src={src} alt="Profile" className={`${dimension} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <div className={`flex ${dimension} shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-amber-500 font-bold text-white`}>
      {initials}
    </div>
  );
}

function relativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  const difference = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(difference / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const notificationStyles: Record<DinerNotification["tone"], { icon: typeof Bell; className: string }> = {
  info: { icon: Clock3, className: "bg-blue-50 text-blue-600" },
  success: { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600" },
  warning: { icon: CalendarCheck, className: "bg-amber-50 text-amber-600" },
  danger: { icon: AlertCircle, className: "bg-red-50 text-red-600" },
};

export function DashboardTopbar({
  user,
  notifications,
}: {
  user: SafeUser;
  notifications: DinerNotification[];
}) {
  const router = useRouter();
  const clerk = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [seenNotificationIds, setSeenNotificationIds] = useState<Set<string>>(new Set());
  const roleBadge = getRoleBadgeProps(user.role);
  const initials = user.name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread && !seenNotificationIds.has(notification.id)).length,
    [notifications, seenNotificationIds]
  );

  function openNotifications() {
    const nextState = !notificationsOpen;
    setNotificationsOpen(nextState);
    setDropdownOpen(false);
    setMobileSearchOpen(false);
    if (nextState) {
      setSeenNotificationIds(new Set(notifications.map((notification) => notification.id)));
    }
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    const destination = user.role === "CLIENT"
      ? "/dashboard/explore"
      : user.role === "RESTAURANT_OWNER"
        ? "/dashboard/restaurant/reservations"
        : "/dashboard/admin/restaurants";

    setMobileSearchOpen(false);
    router.push(`${destination}?q=${encodeURIComponent(query)}`);
  }

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
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/40 bg-white/85 px-4 backdrop-blur-xl lg:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon-sm" className="shrink-0 lg:hidden" />}>
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0" showCloseButton={false}>
          <div className="flex items-center justify-between px-4 pb-2 pt-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-orange to-amber-500">
                <UtensilsCrossed className="size-4 text-white" />
              </div>
              <span className="font-heading text-base font-bold text-brand-dark">Chop<span className="text-brand-orange">Wise</span></span>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => setMobileOpen(false)}>
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <Separator className="my-2" />
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <UserAvatar initials={initials} src={user.profileImage} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
          <Separator className="my-1" />
          <div className="flex-1 py-2">
            <MobileSidebarNav role={user.role as "CLIENT" | "RESTAURANT_OWNER" | "ADMIN"} onNavigate={() => setMobileOpen(false)} />
          </div>
          <Separator />
          <div className="p-3">
            <button
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/10"
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

      <form onSubmit={handleSearch} className="mx-auto hidden max-w-sm flex-1 md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={user.role === "CLIENT" ? "Search restaurants or food..." : "Search dashboard..."}
            className="h-8 rounded-lg border-transparent bg-muted/40 pl-9 pr-16 text-sm focus:border-input focus:bg-white"
          />
          <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[10px] font-bold text-brand-orange hover:bg-brand-orange/10">
            Search
          </button>
        </div>
      </form>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 md:hidden"
          onClick={() => {
            setMobileSearchOpen(!mobileSearchOpen);
            setNotificationsOpen(false);
            setDropdownOpen(false);
          }}
        >
          <Search className="size-4 text-muted-foreground" />
          <span className="sr-only">Search</span>
        </Button>

        <div className="relative">
          <Button variant="ghost" size="icon-sm" className="relative shrink-0" onClick={openNotifications}>
            <Bell className="size-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-brand-orange px-1 text-[9px] font-black text-white ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>

          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border/60 bg-white shadow-2xl animate-in fade-in-0 zoom-in-95">
                <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">Notifications</p>
                    <p className="text-[11px] text-muted-foreground">Reservation updates for your diner account</p>
                  </div>
                  <Bell className="size-4 text-brand-orange" />
                </div>

                <div className="max-h-[360px] overflow-y-auto">
                  {user.role !== "CLIENT" ? (
                    <div className="px-5 py-10 text-center">
                      <Bell className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-3 text-sm font-semibold text-foreground">No diner notifications</p>
                      <p className="mt-1 text-xs text-muted-foreground">Operational updates are available from your dashboard pages.</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <Bell className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-3 text-sm font-semibold text-foreground">No notifications yet</p>
                      <p className="mt-1 text-xs text-muted-foreground">Reservation confirmations and payment reminders will appear here.</p>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const style = notificationStyles[notification.tone];
                      const NotificationIcon = style.icon;
                      return (
                        <button
                          key={notification.id}
                          onClick={() => {
                            setNotificationsOpen(false);
                            router.push(notification.href);
                          }}
                          className="flex w-full items-start gap-3 border-b border-border/30 px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted/40"
                        >
                          <div className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${style.className}`}>
                            <NotificationIcon className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-xs font-bold leading-5 text-foreground">{notification.title}</p>
                              <span className="shrink-0 text-[10px] text-muted-foreground">{relativeTime(notification.createdAt)}</span>
                            </div>
                            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{notification.message}</p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {user.role === "CLIENT" && (
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      router.push("/dashboard/reservations");
                    }}
                    className="w-full border-t border-border/40 px-4 py-3 text-center text-xs font-bold text-brand-orange transition-colors hover:bg-brand-orange/5"
                  >
                    View all reservations
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mx-1 hidden h-6 w-px bg-border/60 sm:block" />

        <div className="relative">
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotificationsOpen(false);
              setMobileSearchOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg py-1 pl-1.5 pr-2 transition-colors hover:bg-muted/80"
          >
            <UserAvatar initials={initials} src={user.profileImage} />
            <div className="hidden flex-col items-start sm:flex">
              <span className="text-[13px] font-semibold leading-tight text-foreground">{user.name}</span>
              <span className={`mt-0.5 rounded-full px-1.5 py-px text-[10px] font-semibold leading-tight ${roleBadge.className}`}>{roleBadge.label}</span>
            </div>
            <ChevronDown className={`hidden size-3.5 text-muted-foreground transition-transform sm:block ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-border/60 bg-white py-1 shadow-lg animate-in fade-in-0 zoom-in-95">
                <div className="border-b border-border/40 px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <UserAvatar initials={initials} src={user.profileImage} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/80"
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
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
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

      {mobileSearchOpen && (
        <div className="absolute inset-x-0 top-full border-b border-border/50 bg-white p-3 shadow-lg md:hidden">
          <form onSubmit={handleSearch} className="mx-auto flex max-w-xl items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search restaurants or food..."
                className="h-10 rounded-xl pl-9"
              />
            </div>
            <Button type="submit" className="h-10 rounded-xl bg-brand-orange px-4 text-white">Search</Button>
          </form>
        </div>
      )}
    </header>
  );
}
