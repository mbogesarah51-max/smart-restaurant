"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Wallet,
  CalendarCheck,
  TrendingUp,
  Users2,
  BarChart3,
  Store,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getAdminAnalytics } from "@/app/actions/admin";
import {
  AdminPageHeader,
  KpiCard,
  SectionCard,
  BarTrend,
  Donut,
  Legend,
  HBars,
  EmptyState,
} from "@/components/admin/admin-kit";

type Analytics = NonNullable<Awaited<ReturnType<typeof getAdminAnalytics>>>;

const STATUS_META: Record<string, { label: string; color: string }> = {
  CONFIRMED: { label: "Confirmed", color: "#10B981" },
  AWAITING_RESPONSE: { label: "Awaiting", color: "#F59E0B" },
  PAYMENT_PENDING: { label: "Payment pending", color: "#3B82F6" },
  ACCEPTED: { label: "Accepted", color: "#14B8A6" },
  CANCELLED: { label: "Cancelled", color: "#F43F5E" },
  REJECTED: { label: "Rejected", color: "#FB7185" },
  PENDING: { label: "Pending", color: "#A8A29E" },
};
const ROLE_META: Record<string, { label: string; color: string }> = {
  CLIENT: { label: "Diners", color: "#3B82F6" },
  RESTAURANT_OWNER: { label: "Owners", color: "#10B981" },
  ADMIN: { label: "Admins", color: "#8B5CF6" },
};

export function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAdminAnalytics().then((result) => {
      if (cancelled) return;
      setData(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="size-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Analytics" icon={BarChart3} />
        <SectionCard>
          <EmptyState icon={BarChart3} title="Analytics unavailable" hint="Please try again shortly." />
        </SectionCard>
      </div>
    );
  }

  const { kpis } = data;

  const statusSegments = data.statusBreakdown
    .map((s) => ({
      label: STATUS_META[s.status]?.label ?? s.status,
      value: s.count,
      color: STATUS_META[s.status]?.color ?? "#A8A29E",
    }))
    .sort((a, b) => b.value - a.value);

  const roleSegments = data.roleBreakdown
    .map((r) => ({
      label: ROLE_META[r.role]?.label ?? r.role,
      value: r.count,
      color: ROLE_META[r.role]?.color ?? "#A8A29E",
    }))
    .sort((a, b) => b.value - a.value);

  const bookingTrend = data.reservationsByDay.map((d) => ({ label: d.label, value: d.reservations }));
  const revenueTrend = data.reservationsByDay.map((d) => ({ label: d.label, value: d.revenue }));
  const signupTrend = data.usersByDay.map((d) => ({ label: d.label, value: d.count }));

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Analytics" subtitle="Performance across the last 30 days." icon={BarChart3} />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total revenue" value={formatPrice(kpis.totalRevenue)} icon={Wallet} accent="violet" sub="Confirmed booking fees" />
        <KpiCard
          label="Reservations"
          value={kpis.totalReservations}
          icon={CalendarCheck}
          accent="orange"
          sub={`${kpis.newReservations30d} in last 30 days`}
          spark={bookingTrend.map((d) => d.value)}
        />
        <KpiCard label="Confirmation rate" value={`${kpis.conversionRate}%`} icon={TrendingUp} accent="emerald" sub={`${kpis.confirmedCount} confirmed · ${kpis.cancelledCount} cancelled`} />
        <KpiCard label="Avg party size" value={kpis.avgPartySize} icon={Users2} accent="blue" sub="Guests per booking" />
      </div>

      {/* Bookings + status */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="Bookings over time" description="Reservation requests per day">
          {data.reservationsByDay.every((d) => d.reservations === 0) ? (
            <EmptyState icon={CalendarCheck} title="No bookings in this window" />
          ) : (
            <BarTrend data={bookingTrend} accent="orange" height={210} />
          )}
        </SectionCard>
        <SectionCard title="Reservation status" description="All-time breakdown">
          {statusSegments.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="No reservations yet" />
          ) : (
            <div className="flex flex-col items-center gap-5">
              <Donut segments={statusSegments} centerSub="total" />
              <div className="w-full">
                <Legend items={statusSegments} />
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Revenue + roles */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="Revenue over time" description="Confirmed booking fees per day (XAF)">
          {data.reservationsByDay.every((d) => d.revenue === 0) ? (
            <EmptyState icon={Wallet} title="No revenue in this window" />
          ) : (
            <BarTrend data={revenueTrend} accent="violet" height={210} valueSuffix=" XAF" />
          )}
        </SectionCard>
        <SectionCard title="Users by role" description="Account distribution">
          {roleSegments.length === 0 ? (
            <EmptyState icon={Users2} title="No users yet" />
          ) : (
            <div className="flex flex-col items-center gap-5">
              <Donut segments={roleSegments} centerSub="users" />
              <div className="w-full">
                <Legend items={roleSegments} />
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Top restaurants + signups */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard title="Top restaurants" description="By total reservations">
          {data.topRestaurants.length === 0 || data.topRestaurants.every((r) => r.reservations === 0) ? (
            <EmptyState icon={Store} title="No booking data yet" />
          ) : (
            <HBars items={data.topRestaurants.map((r) => ({ label: r.name, sub: r.city, value: r.reservations }))} accent="orange" />
          )}
        </SectionCard>
        <SectionCard title="New sign-ups" description="Registrations per day (30 days)">
          {data.usersByDay.every((d) => d.count === 0) ? (
            <EmptyState icon={Users2} title="No new sign-ups in this window" />
          ) : (
            <BarTrend data={signupTrend} accent="emerald" height={180} />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
