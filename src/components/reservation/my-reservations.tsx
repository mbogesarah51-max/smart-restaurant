"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
  PENDING: { label: "Pending", className: "bg-gray-100 text-gray-700" },
  AWAITING_RESPONSE: { label: "Awaiting Response", className: "bg-amber-100 text-amber-700" },
  ACCEPTED: { label: "Accepted", className: "bg-blue-100 text-blue-700" },
  PAYMENT_PENDING: { label: "Payment Pending", className: "bg-brand-orange/10 text-brand-orange" },
  CONFIRMED: { label: "Confirmed", className: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-500" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700" },
};

type ReservationWithRestaurant = Reservation & {
  restaurant: Pick<Restaurant, "id" | "name" | "slug" | "bannerImage" | "city" | "address" | "phone">;
};

export function MyReservations() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pending");
  const [reservations, setReservations] = useState<ReservationWithRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await getClientReservations({ status: tab });
    setReservations(data as ReservationWithRestaurant[]);
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-heading text-foreground">My Reservations</h1>
        <p className="text-sm text-muted-foreground">Track and manage your restaurant bookings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.value
                ? "bg-brand-orange text-white"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : reservations.length === 0 ? (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-3">
                <CalendarCheck className="size-6 text-muted-foreground/50" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                {tab === "pending" ? "No pending reservations" :
                 tab === "upcoming" ? "No upcoming reservations" :
                 tab === "past" ? "No past reservations" :
                 "No cancelled reservations"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-4">
                {tab === "pending" || tab === "upcoming"
                  ? "Explore restaurants and make your first booking!"
                  : "Your reservation history will appear here."}
              </p>
              {(tab === "pending" || tab === "upcoming") && (
                <Link
                  href="/dashboard/explore"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-brand-orange hover:bg-brand-orange-hover text-white transition-colors"
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
          {reservations.map((r) => (
            <ReservationCard
              key={r.id}
              reservation={r}
              onCancel={fetchData}
              onExpire={fetchData}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Reservation Card ────────────────────────────────────────────────────────

function ReservationCard({ reservation: r, onCancel, onExpire }: {
  reservation: ReservationWithRestaurant;
  onCancel: () => void;
  onExpire: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const status = STATUS_BADGE[r.status] || STATUS_BADGE.PENDING;
  const date = new Date(r.date);
  const formattedDate = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const canCancel = ["AWAITING_RESPONSE", "ACCEPTED", "PAYMENT_PENDING", "PENDING"].includes(r.status);
  const isAwaiting = r.status === "AWAITING_RESPONSE";

  // Parse preferences
  let prefs: { occasion?: string; notes?: string; preOrder?: { name: string; price: number; quantity: number }[]; estimatedTotal?: number } = {};
  try { if (r.preferences) prefs = JSON.parse(r.preferences); } catch {}

  async function handleCancel() {
    setCancelling(true);
    const result = await cancelReservation(r.id);
    if (result.success) {
      toast.success(result.message);
      onCancel();
    } else {
      toast.error(result.message);
    }
    setCancelling(false);
    setConfirmCancel(false);
  }

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <div className="flex gap-3 p-4">
        {/* Restaurant image */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-muted/30">
          {r.restaurant.bannerImage ? (
            <Image src={r.restaurant.bannerImage} alt={r.restaurant.name} fill className="object-cover" sizes="80px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <UtensilsCrossed className="size-6 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link href={`/dashboard/restaurants/${r.restaurant.slug}`} className="text-sm font-semibold text-foreground hover:text-brand-orange transition-colors">
                {r.restaurant.name}
              </Link>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><CalendarCheck className="size-3" /> {formattedDate}</span>
                <span className="flex items-center gap-1"><Clock className="size-3" /> {r.time}</span>
                <span className="flex items-center gap-1"><Users className="size-3" /> {r.guestCount}</span>
              </div>
            </div>
            <Badge variant="secondary" className={`border-0 text-[10px] shrink-0 ${status.className}`}>
              {status.label}
            </Badge>
          </div>

          {/* Countdown for awaiting */}
          {isAwaiting && r.responseDeadline && (
            <div className="mt-2">
              <CountdownTimer deadline={r.responseDeadline} onExpire={onExpire} />
            </div>
          )}

          {/* Pay Now for PAYMENT_PENDING */}
          {r.status === "PAYMENT_PENDING" && (
            <div className="mt-2 flex items-center gap-3">
              <Link
                href={`/dashboard/reservations/${r.id}/pay`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                Pay Now — {formatPrice(r.bookingFee || 500)}
              </Link>
              {r.paymentDeadline && (
                <CountdownTimer deadline={r.paymentDeadline} onExpire={onExpire} />
              )}
            </div>
          )}

          {/* Expand / actions */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              {expanded ? "Less" : "Details"}
            </button>

            {canCancel && !confirmCancel && (
              <button
                onClick={() => setConfirmCancel(true)}
                className="flex items-center gap-1 text-xs font-medium text-destructive hover:text-destructive/80 transition-colors ml-auto"
              >
                <X className="size-3" /> Cancel
              </button>
            )}

            {confirmCancel && (
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-2.5 py-1 rounded-md text-xs font-medium text-white bg-destructive hover:bg-destructive/90 transition-colors"
                >
                  {cancelling ? <Loader2 className="size-3 animate-spin" /> : "Yes, cancel"}
                </button>
                <button onClick={() => setConfirmCancel(false)} className="px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-muted/80">
                  No
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border/30 mt-0">
          <div className="pt-3 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-3.5" />
              <span>{r.restaurant.address}, {r.restaurant.city}</span>
            </div>

            {prefs.occasion && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Occasion</span>
                <span className="text-foreground">{prefs.occasion}</span>
              </div>
            )}

            {prefs.notes && (
              <div>
                <span className="text-muted-foreground text-xs">Special requests:</span>
                <p className="text-foreground text-xs mt-0.5">{prefs.notes}</p>
              </div>
            )}

            {prefs.preOrder && prefs.preOrder.length > 0 && (
              <div className="pt-2 border-t border-border/30">
                <p className="text-xs font-semibold text-foreground mb-1.5">Pre-selected meals</p>
                {prefs.preOrder.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                    <span className="text-foreground">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                {prefs.estimatedTotal && (
                  <div className="flex justify-between text-xs font-bold pt-1 mt-1 border-t border-border/20">
                    <span>Estimated total</span>
                    <span className="text-brand-orange">{formatPrice(prefs.estimatedTotal)}</span>
                  </div>
                )}
              </div>
            )}

            {r.status === "PAYMENT_PENDING" && (
              <div className="pt-2">
                <button className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-brand-orange hover:bg-brand-orange-hover text-white transition-colors">
                  Complete Payment — {formatPrice(r.bookingFee || 500)}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
