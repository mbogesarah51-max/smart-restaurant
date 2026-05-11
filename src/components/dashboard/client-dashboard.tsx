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
  BookOpen,
  Heart,
  Search,
  Bot,
  ArrowRight,
  UtensilsCrossed,
} from "lucide-react";
import type { SafeUser } from "@/types";

export function ClientDashboard({ user }: { user: SafeUser }) {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">
          Welcome back, {user.name.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Discover and reserve at the best restaurants near you.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/10">
                <CalendarCheck className="size-6 text-brand-orange" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Upcoming Reservations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <BookOpen className="size-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50">
                <Heart className="size-6 text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Favorite Restaurants</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border/50 shadow-sm group hover:shadow-md hover:border-brand-orange/20 transition-all cursor-pointer">
          <Link href="/dashboard/explore">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-orange to-amber-500 shadow-sm shadow-brand-orange/20">
                    <Search className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Find a Restaurant</h3>
                    <p className="text-sm text-muted-foreground">Browse restaurants near you</p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="border-border/50 shadow-sm group hover:shadow-md hover:border-brand-orange/20 transition-all cursor-pointer">
          <Link href="/dashboard/ai-recommend">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm shadow-violet-500/20">
                    <Bot className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Get AI Recommendation</h3>
                    <p className="text-sm text-muted-foreground">Tell us your budget & preferences</p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Reservations */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-heading">Recent Reservations</CardTitle>
          <CardDescription>Your latest restaurant bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
              <UtensilsCrossed className="size-7 text-muted-foreground/50" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">No reservations yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Start exploring restaurants and make your first reservation. We&apos;ll keep track of all your bookings here.
            </p>
            <Link
              href="/dashboard/explore"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-brand-orange hover:bg-brand-orange-hover text-white transition-colors"
            >
              <Search className="size-4 mr-1.5" />
              Explore Restaurants
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
