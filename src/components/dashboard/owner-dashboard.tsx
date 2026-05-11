"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarCheck,
  Clock,
  TrendingUp,
  Store,
  ArrowRight,
  CheckCircle2,
  Pencil,
  Bell,
  CreditCard,
  Users,
} from "lucide-react";
import type { SafeUser, RestaurantWithDetails } from "@/types";
import type { OwnerDashboardStats } from "@/app/actions/reservation";

export function OwnerDashboard({
  user,
  restaurant,
  stats,
}: {
  user: SafeUser;
  restaurant: RestaurantWithDetails;
  stats: OwnerDashboardStats;
}) {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">
          Welcome back, {user.name.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage <span className="font-medium text-foreground">{restaurant.name}</span> — bookings, menu, and more.
        </p>
      </div>

      {/* Pending Approval Banner */}
      {!restaurant.isApproved && (
        <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                <Clock className="size-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-0.5">Pending Approval</h3>
                <p className="text-sm text-muted-foreground">
                  Your restaurant is being reviewed by our team. You&apos;ll be notified once it&apos;s approved and visible to diners.
                  In the meantime, you can edit your profile and set up your menu.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Banner */}
      {restaurant.isApproved && (
        <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <p className="text-sm text-emerald-700 font-medium">
                Your restaurant is live and visible to diners!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats — Row 1: Action-needed stats */}
      {(stats.awaitingResponse > 0 || stats.paymentPending > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.awaitingResponse > 0 && (
            <Link href="/dashboard/restaurant/reservations">
              <Card className="border-amber-300 bg-amber-50/60 shadow-sm hover:shadow-md transition-all cursor-pointer">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                      <Bell className="size-6 text-amber-600" />
                      <span className="absolute -top-1 -right-1 size-5 flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold animate-pulse">
                        {stats.awaitingResponse}
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-700">{stats.awaitingResponse}</p>
                      <p className="text-sm font-medium text-amber-600">Awaiting Your Response</p>
                    </div>
                    <ArrowRight className="size-4 text-amber-400 ml-auto" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {stats.paymentPending > 0 && (
            <Card className="border-brand-orange/30 bg-brand-orange/5 shadow-sm">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/10">
                    <CreditCard className="size-6 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-brand-orange">{stats.paymentPending}</p>
                    <p className="text-sm font-medium text-brand-orange/80">Awaiting Client Payment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Stats — Row 2: Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-orange/10">
                <CalendarCheck className="size-5 text-brand-orange" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{stats.confirmedToday}</p>
                <p className="text-xs text-muted-foreground">Today&apos;s Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <Users className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{stats.confirmedUpcoming}</p>
                <p className="text-xs text-muted-foreground">Upcoming Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <TrendingUp className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{stats.totalThisMonth}</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
                <Store className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{stats.totalAllTime}</p>
                <p className="text-xs text-muted-foreground">Total All Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border/50 shadow-sm group hover:shadow-md hover:border-brand-orange/20 transition-all cursor-pointer">
          <Link href="/dashboard/restaurant/edit">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm shadow-emerald-500/20">
                    <Pencil className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Edit Restaurant</h3>
                    <p className="text-sm text-muted-foreground">Update profile, photos & hours</p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="border-border/50 shadow-sm group hover:shadow-md hover:border-brand-orange/20 transition-all cursor-pointer">
          <Link href="/dashboard/restaurant/menu">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-orange to-amber-500 shadow-sm shadow-brand-orange/20">
                    <Store className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Manage Menu</h3>
                    <p className="text-sm text-muted-foreground">Add and edit menu items</p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Incoming Reservations */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-heading">Incoming Reservation Requests</CardTitle>
          <CardDescription>Review and respond to new booking requests</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.awaitingResponse > 0 ? (
            <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-3">
                <Bell className="size-5 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {stats.awaitingResponse} reservation{stats.awaitingResponse !== 1 ? "s" : ""} waiting for your response
                  </p>
                  <p className="text-xs text-muted-foreground">Respond before the deadline expires</p>
                </div>
              </div>
              <Link
                href="/dashboard/restaurant/reservations"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors"
              >
                Review Now
                <ArrowRight className="size-3" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-3">
                <CalendarCheck className="size-6 text-muted-foreground/50" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">No pending requests</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                When diners make reservation requests, they&apos;ll appear here for you to accept or decline.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
