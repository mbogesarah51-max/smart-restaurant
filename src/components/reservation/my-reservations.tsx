"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  CalendarCheck,
  Clock,
  Users,
  MapPin,
  UtensilsCrossed,
  Loader2,
  X,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { BOOKING_FEE } from "@/lib/config";
import { CountdownTimer } from "@/components/shared/countdown-timer";
import { getClientReservations, cancelReservation } from "@/app/actions/reservation";
import type { Reservation, Restaurant } from "@/generated/prisma/client";

type Tab = "upcoming" | "pending" | "past" | "cancelled";

const TABS: { value: Tab; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300" },
  AWAITING_RESPONSE: { label: "Awaiting Response", className: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  ACCEPTED: { label: "Accepted", className: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  PAYMENT_PENDING: { label: "Payment Pending", className: "bg-brand-orange/10 text-brand-orange" },
  CONFIRMED: { label: "Confirmed", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-500 dark:bg-gray-500/15 dark:text-gray-400" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300" },
};

type ReservationWithRestaurant = Reservation & {
  restaurant: Pick<Restaurant, "id" | "name" | "slug" | "bannerImage" | "city" | "address" | "phone">;
};

export function MyReservations() {
  const [tab, setTab] = useState<Tab>("pending");
  const [reservations, setReservations] = useState<ReservationWithRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  const fetchData = useCallback(async (showLoader = true) => {
    const requestId = ++requestIdRef.current;
    if (showLoader) setLoading(true);

    try {
      const data = await getClientReservations({ status: tab });
      if (requestId === requestIdRef.current) {
        setReservations(data as ReservationWithRestaurant[]);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [tab]);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">My Reservations</h1>
        <p className="text-sm text-muted-foreground">Track and manage your restaurant bookings</p>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((item) => (
          <button
            key={item.value}
            onClick={() => setTab(item.value)}
            className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              tab === item.value
                ? "bg-brand-orange text-white"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : reservations.length === 0 ? (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
                <CalendarCheck className="size-6 text-muted-foreground/50" />
              </div>
              <h3 className="mb-1 text-sm font-medium text-foreground">
                {tab === "pending" ? "No pending reservations" :
                 tab === "upcoming" ? "No upcoming reservations" :
                 tab === "past" ? "No past reservations" :
                 "No cancelled reservations"}
              </h3>
              <p className="mb-4 max-w-xs text-sm text-muted-foreground">
                {tab === "pending" || tab === "upcoming"
                  ? "Explore restaurants and make your first booking!"
                  : "Your reservation history will appear here."}
              </p>
              {(tab === "pending" || tab === "upcoming") && (
                <Link
                  href="/dashboard/explore"
                  className="flex items-center gap-1.5 rounded-lg bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-hover"
                >
                  <Search className="size-4" />
                  Explore Restaurants
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onRefresh={() => fetchData(false)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReservationCard({
  reservation,
  onRefresh,
}: {
  reservation: ReservationWithRestaurant;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const status = STATUS_BADGE[reservation.status] || STATUS_BADGE.PENDING;
  const date = new Date(reservation.date);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const canCancel = ["AWAITING_RESPONSE", "ACCEPTED", "PAYMENT_PENDING", "PENDING"].includes(reservation.status);
  const isAwaiting = reservation.status === "AWAITING_RESPONSE";

  let preferences: {
    occasion?: string;
    notes?: string;
    preOrder?: { name: string; price: number; quantity: number }[];
    estimatedTotal?: number;
  } = {};

  try {
    if (reservation.preferences) preferences = JSON.parse(reservation.preferences);
  } catch {
    preferences = {};
  }

  async function handleCancel() {
    setCancelling(true);
    const result = await cancelReservation(reservation.id);

    if (result.success) {
      toast.success(result.message);
      onRefresh();
    } else {
      toast.error(result.message);
    }

    setCancelling(false);
    setConfirmCancel(false);
  }

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm">
      <div className="flex gap-3 p-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted/30">
          {reservation.restaurant.bannerImage ? (
            <Image
              src={reservation.restaurant.bannerImage}
              alt={reservation.restaurant.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <UtensilsCrossed className="size-6 text-muted-foreground/30" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                href={`/dashboard/restaurants/${reservation.restaurant.slug}`}
                className="text-sm font-semibold text-foreground transition-colors hover:text-brand-orange"
              >
                {reservation.restaurant.name}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CalendarCheck className="size-3" /> {formattedDate}</span>
                <span className="flex items-center gap-1"><Clock className="size-3" /> {reservation.time}</span>
                <span className="flex items-center gap-1"><Users className="size-3" /> {reservation.guestCount}</span>
              </div>
            </div>
            <Badge variant="secondary" className={`shrink-0 border-0 text-[10px] ${status.className}`}>
              {status.label}
            </Badge>
          </div>

          {isAwaiting && reservation.responseDeadline && (
            <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-500/10">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <CountdownTimer
                  deadline={reservation.responseDeadline}
                  expiredLabel="Still pending"
                />
                <span className="text-[11px] text-amber-800 dark:text-amber-300">
                  Your request stays pending until the restaurant responds or you cancel it.
                </span>
              </div>
            </div>
          )}

          {reservation.status === "PAYMENT_PENDING" && (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Link
                href={`/dashboard/reservations/${reservation.id}/pay`}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Pay Now — {formatPrice(reservation.bookingFee || BOOKING_FEE)}
              </Link>
              {reservation.paymentDeadline && (
                <CountdownTimer
                  deadline={reservation.paymentDeadline}
                  onExpire={onRefresh}
                  invokeOnExpire
                  expiredLabel="Payment window ended"
                />
              )}
            </div>
          )}

          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              {expanded ? "Less" : "Details"}
            </button>

            {canCancel && !confirmCancel && (
              <button
                onClick={() => setConfirmCancel(true)}
                className="ml-auto flex items-center gap-1 text-xs font-medium text-destructive transition-colors hover:text-destructive/80"
              >
                <X className="size-3" /> Cancel
              </button>
            )}

            {confirmCancel && (
              <div className="ml-auto flex items-center gap-1.5">
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="rounded-md bg-destructive px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-destructive/90"
                >
                  {cancelling ? <Loader2 className="size-3 animate-spin" /> : "Yes, cancel"}
                </button>
                <button
                  onClick={() => setConfirmCancel(false)}
                  className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted/80"
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-0 border-t border-border/30 px-4 pb-4 pt-0">
          <div className="space-y-2 pt-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-3.5" />
              <span>{reservation.restaurant.address}, {reservation.restaurant.city}</span>
            </div>

            {preferences.occasion && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Occasion</span>
                <span className="text-foreground">{preferences.occasion}</span>
              </div>
            )}

            {preferences.notes && (
              <div>
                <span className="text-xs text-muted-foreground">Special requests:</span>
                <p className="mt-0.5 text-xs text-foreground">{preferences.notes}</p>
              </div>
            )}

            {preferences.preOrder && preferences.preOrder.length > 0 && (
              <div className="border-t border-border/30 pt-2">
                <p className="mb-1.5 text-xs font-semibold text-foreground">Pre-selected meals</p>
                {preferences.preOrder.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                    <span className="text-foreground">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                {preferences.estimatedTotal && (
                  <div className="mt-1 flex justify-between border-t border-border/20 pt-1 text-xs font-bold">
                    <span>Estimated total</span>
                    <span className="text-brand-orange">{formatPrice(preferences.estimatedTotal)}</span>
                  </div>
                )}
              </div>
            )}

            {reservation.status === "PAYMENT_PENDING" && (
              <div className="pt-2">
                <Link
                  href={`/dashboard/reservations/${reservation.id}/pay`}
                  className="block w-full rounded-lg bg-brand-orange px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-orange-hover"
                >
                  Complete Payment — {formatPrice(reservation.bookingFee || BOOKING_FEE)}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
