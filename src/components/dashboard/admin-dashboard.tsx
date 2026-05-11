"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  UtensilsCrossed,
  CalendarCheck,
  Clock,
  Store,
  ArrowRight,
  UserPlus,
} from "lucide-react";
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
  recentUsers: { id: string; name: string; email: string; role: string; createdAt: Date }[];
  pendingRestaurantsList: { id: string; name: string; city: string; createdAt: Date; owner: { name: string; email: string } }[];
};

const ROLE_COLORS: Record<string, string> = {
  CLIENT: "bg-blue-100 text-blue-700",
  RESTAURANT_OWNER: "bg-emerald-100 text-emerald-700",
  ADMIN: "bg-purple-100 text-purple-700",
};

const ROLE_LABELS: Record<string, string> = {
  CLIENT: "Diner",
  RESTAURANT_OWNER: "Owner",
  ADMIN: "Admin",
};

export function AdminDashboard({ user, stats }: { user: SafeUser; stats: AdminStats }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Platform Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor and manage ChopWise.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          sub={`${stats.clientCount} diners · ${stats.ownerCount} owners · ${stats.adminCount} admins`}
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          label="Restaurants"
          value={stats.totalRestaurants}
          sub={`${stats.approvedRestaurants} approved · ${stats.pendingRestaurants} pending`}
          icon={UtensilsCrossed}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Reservations"
          value={stats.totalReservations}
          sub="All time"
          icon={CalendarCheck}
          iconBg="bg-brand-orange/10"
          iconColor="text-brand-orange"
        />
        <Link href="/dashboard/admin/restaurants?status=pending" className="block">
          <Card className={`border-border/50 shadow-sm h-full transition-colors ${stats.pendingRestaurants > 0 ? "border-amber-300 bg-amber-50/30 hover:border-amber-400" : "hover:border-brand-orange/20"}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approvals</p>
                  <p className={`text-2xl font-bold mt-1 ${stats.pendingRestaurants > 0 ? "text-amber-600" : "text-foreground"}`}>
                    {stats.pendingRestaurants}
                  </p>
                  <p className="text-xs text-brand-orange font-medium flex items-center gap-1 mt-1">
                    Review now <ArrowRight className="size-3" />
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <Clock className="size-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Restaurants */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-heading">Pending Restaurants</CardTitle>
                <CardDescription>Awaiting your review</CardDescription>
              </div>
              {stats.pendingRestaurants > 0 && (
                <Link href="/dashboard/admin/restaurants?status=pending" className="text-xs font-medium text-brand-orange hover:underline">
                  View all
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {stats.pendingRestaurantsList.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 mb-3">
                  <Store className="size-5 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.pendingRestaurantsList.map((r) => (
                  <Link
                    key={r.id}
                    href={`/dashboard/admin/restaurants/${r.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 shrink-0">
                      <Store className="size-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-brand-orange">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.city} · by {r.owner.name}</p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-heading">Recent Registrations</CardTitle>
                <CardDescription>Latest users</CardDescription>
              </div>
              <Link href="/dashboard/admin/users" className="text-xs font-medium text-brand-orange hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No users yet</p>
            ) : (
              <div className="space-y-2">
                {stats.recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 shrink-0">
                      <UserPlus className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <Badge variant="secondary" className={`border-0 text-[10px] shrink-0 ${ROLE_COLORS[u.role]}`}>
                      {ROLE_LABELS[u.role] || u.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor }: {
  label: string; value: number; sub: string;
  icon: typeof Users; iconBg: string; iconColor: string;
}) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className={`size-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
