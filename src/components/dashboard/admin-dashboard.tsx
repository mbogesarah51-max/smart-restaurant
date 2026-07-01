"use client";

import Link from "next/link";
import {
  Users,
  UtensilsCrossed,
  CalendarCheck,
  Wallet,
  Clock,
  Store,
  ArrowRight,
  ArrowUpRight,
  LayoutDashboard,
  UserPlus,
  BarChart3,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AdminPageHeader,
  KpiCard,
  SectionCard,
  EmptyState,
} from "@/components/admin/admin-kit";
import type { SafeUser } from "@/types";

type AdminStats = {
  totalUsers: number;
  clientCount: number;
  ownerCount: number;
  adminCount: number;
  totalRestaurants: number;
  approvedRestaurants: number;
  pendingRestaurants: number;
  totalReservations: number;
  confirmedReservations: number;
  totalRevenue: number;
  trend: number[];
  recentUsers: { id: string; name: string; email: string; role: string; createdAt: Date }[];
  pendingRestaurantsList: { id: string; name: string; city: string; createdAt: Date; owner: { name: string; email: string } }[];
};

const ROLE_COLORS: Record<string, string> = {
  CLIENT: "bg-blue-100 text-blue-700",
  RESTAURANT_OWNER: "bg-emerald-100 text-emerald-700",
  ADMIN: "bg-violet-100 text-violet-700",
};
const ROLE_LABELS: Record<string, string> = {
  CLIENT: "Diner",
  RESTAURANT_OWNER: "Owner",
  ADMIN: "Admin",
};

export function AdminDashboard({ stats }: { user: SafeUser; stats: AdminStats }) {
  const trendData = stats.trend.map((count, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (stats.trend.length - 1 - i));
    return { label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), value: count };
  });
  const max = Math.max(...trendData.map((d) => d.value), 1);
  const confirmRate = stats.totalReservations
    ? Math.round((stats.confirmedReservations / stats.totalReservations) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Platform Overview"
        subtitle="Monitor and manage everything happening on ChopWise."
        icon={LayoutDashboard}
        actions={
          <Link href="/dashboard/admin/analytics">
            <Button variant="outline" size="lg" className="rounded-xl">
              <BarChart3 className="size-4" /> Analytics
            </Button>
          </Link>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Users"
          value={stats.totalUsers}
          icon={Users}
          accent="blue"
          sub={`${stats.clientCount} diners · ${stats.ownerCount} owners · ${stats.adminCount} admins`}
          href="/dashboard/admin/users"
        />
        <KpiCard
          label="Restaurants"
          value={stats.totalRestaurants}
          icon={UtensilsCrossed}
          accent="emerald"
          sub={`${stats.approvedRestaurants} approved · ${stats.pendingRestaurants} pending`}
          href="/dashboard/admin/restaurants"
        />
        <KpiCard
          label="Reservations"
          value={stats.totalReservations}
          icon={CalendarCheck}
          accent="orange"
          sub={`${confirmRate}% confirmed`}
          spark={stats.trend}
          href="/dashboard/admin/reservations"
        />
        <KpiCard
          label="Revenue"
          value={formatPrice(stats.totalRevenue)}
          icon={Wallet}
          accent="violet"
          sub="Confirmed booking fees"
          href="/dashboard/admin/analytics"
        />
      </div>

      {/* Activity + pending */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Booking activity"
          description="Requests received over the last 14 days"
          action={
            <Link href="/dashboard/admin/analytics" className="text-xs font-medium text-brand-orange hover:underline">
              Full analytics
            </Link>
          }
        >
          {max <= 1 && stats.trend.every((v) => v === 0) ? (
            <EmptyState icon={CalendarCheck} title="No recent bookings" hint="New reservations will show up here." />
          ) : (
            <div className="flex items-end gap-[5px] h-48">
              {trendData.map((d, i) => (
                <div key={i} className="group/bar relative flex h-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-orange-400 to-amber-500 transition-[filter] duration-200 group-hover/bar:brightness-110"
                    style={{ height: `${d.value > 0 ? Math.max((d.value / max) * 100, 4) : 0}%` }}
                  />
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-brand-dark px-2 py-1 text-[10px] font-medium text-white shadow-lg group-hover/bar:block">
                    {d.label} · <span className="tabular-nums">{d.value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>{trendData[0]?.label}</span>
            <span>{trendData[Math.floor(trendData.length / 2)]?.label}</span>
            <span>Today</span>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <KpiCard
            label="Pending approvals"
            value={stats.pendingRestaurants}
            icon={Clock}
            accent="amber"
            sub={stats.pendingRestaurants > 0 ? "Needs your review" : "All caught up"}
            href="/dashboard/admin/restaurants?status=pending"
            highlight={stats.pendingRestaurants > 0}
          />
          <KpiCard
            label="Confirmed bookings"
            value={stats.confirmedReservations}
            icon={CalendarCheck}
            accent="emerald"
            sub={`${confirmRate}% of all reservations`}
            href="/dashboard/admin/reservations?status=CONFIRMED"
          />
        </div>
      </div>

      {/* Pending restaurants + recent users */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard
          title="Pending restaurants"
          description="Awaiting your review"
          bodyClassName="p-3"
          action={
            stats.pendingRestaurants > 0 ? (
              <Link href="/dashboard/admin/restaurants?status=pending" className="text-xs font-medium text-brand-orange hover:underline">
                View all
              </Link>
            ) : undefined
          }
        >
          {stats.pendingRestaurantsList.length === 0 ? (
            <EmptyState icon={Store} title="No pending approvals" hint="New restaurant submissions land here." />
          ) : (
            <div className="space-y-1">
              {stats.pendingRestaurantsList.map((r) => (
                <Link
                  key={r.id}
                  href={`/dashboard/admin/restaurants/${r.id}`}
                  className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-amber-50/70"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600">
                    <Store className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-brand-dark group-hover:text-brand-orange">{r.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.city} · by {r.owner.name}</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-orange" />
                </Link>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Recent registrations"
          description="Newest members"
          bodyClassName="p-3"
          action={
            <Link href="/dashboard/admin/users" className="text-xs font-medium text-brand-orange hover:underline">
              View all
            </Link>
          }
        >
          {stats.recentUsers.length === 0 ? (
            <EmptyState icon={UserPlus} title="No users yet" />
          ) : (
            <div className="space-y-0.5">
              {stats.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted/50">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange/90 to-amber-500 text-[11px] font-bold text-white">
                    {u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-brand-dark">{u.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{u.email}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role] || u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        {[
          { href: "/dashboard/admin/restaurants", label: "Manage restaurants", icon: UtensilsCrossed },
          { href: "/dashboard/admin/users", label: "Manage users", icon: Users },
          { href: "/dashboard/admin/reservations", label: "All reservations", icon: CalendarCheck },
          { href: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group inline-flex items-center gap-2 rounded-xl border border-black/[0.06] bg-white/70 px-3.5 py-2 text-[13px] font-medium text-brand-dark transition-all hover:border-brand-orange/30 hover:bg-brand-orange/5"
          >
            <l.icon className="size-4 text-brand-orange" />
            {l.label}
            <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
