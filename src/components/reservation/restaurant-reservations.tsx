"use client";

import { useState, useCallback } from "react";
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
  Phone,
  MessageCircle,
  Loader2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  PartyPopper,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { CountdownTimer } from "@/components/shared/countdown-timer";
import { useReservationPolling } from "@/hooks/use-reservation-polling";
import {
  getRestaurantReservations,
  getNewReservationCount,
  acceptReservation,
  rejectReservation,
  cancelConfirmedReservation,
} from "@/app/actions/reservation";
import type { Reservation, User } from "@/generated/prisma/client";

type Tab = "new" | "upcoming" | "pending_payment" | "past" | "cancelled";

type ReservationWithUser = Reservation & {
  user: Pick<User, "id" | "name" | "email" | "phone" | "profileImage">;
};

const REJECT_REASONS = [
  "Fully booked",
  "Time slot unavailable",
  "Kitchen closed",
  "Other",
];

export function RestaurantReservations({ restaurantId }: { restaurantId: string }) {
  const [tab, setTab] = useState<Tab>("new");

  // Poll for new reservation count
  const { data: newCount } = useReservationPolling({
    fetcher: () => getNewReservationCount(),
    interval: 30000,
  });

  // Poll for current tab data
  const { data: reservations, isLoading, refresh } = useReservationPolling({
    fetcher: () => getRestaurantReservations({ status: tab }) as Promise<ReservationWithUser[]>,
    interval: tab === "new" ? 15000 : 30000, // faster polling for new requests
  });

  const items = reservations || [];

  const tabs: { value: Tab; label: string; count?: number; pulse?: boolean }[] = [
    { value: "new", label: "New Requests", count: newCount ?? undefined, pulse: (newCount ?? 0) > 0 },
    { value: "upcoming", label: "Upcoming" },
    { value: "pending_payment", label: "Pending Payment" },
    { value: "past", label: "Past" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-heading text-foreground">Reservations</h1>
        <p className="text-sm text-muted-foreground">Manage incoming bookings and reservation requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.value
                ? "bg-brand-orange text-white"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-[10px] px-1.5 py-px rounded-full font-bold ${
                tab === t.value ? "bg-white/20" : "bg-brand-orange text-white"
              } ${t.pulse ? "animate-pulse" : ""}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="py-16 text-center">
            <CalendarCheck className="size-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">
              {tab === "new" ? "No new requests" : `No ${tab.replace("_", " ")} reservations`}
            </p>
            <p className="text-xs text-muted-foreground">
              {tab === "new" ? "New reservation requests will appear here." : "Nothing to show for this category."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <ReservationCard
              key={r.id}
              reservation={r}
              tab={tab}
              onAction={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Reservation Card ────────────────────────────────────────────────────────

function ReservationCard({ reservation: r, tab, onAction }: {
  reservation: ReservationWithUser;
  tab: Tab;
  onAction: () => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const date = new Date(r.date);
  const formattedDate = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const isUrgent = r.responseDeadline && new Date(r.responseDeadline).getTime() - Date.now() < 5 * 60 * 1000;

  let prefs: { occasion?: string; notes?: string; preOrder?: { name: string; price: number; quantity: number }[]; estimatedTotal?: number } = {};
  try { if (r.preferences) prefs = JSON.parse(r.preferences); } catch {}

  async function handleAccept() {
    setAccepting(true);
    const result = await acceptReservation(r.id);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    setAccepting(false);
    onAction();
  }

  async function handleReject() {
    if (!rejectReason.trim()) { toast.error("Please provide a reason"); return; }
    setRejecting(true);
    const result = await rejectReservation(r.id, rejectReason.trim());
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    setRejecting(false);
    setShowReject(false);
    onAction();
  }

  async function handleCancel() {
    if (!cancelReason.trim()) { toast.error("Please provide a reason"); return; }
    setCancelling(true);
    const result = await cancelConfirmedReservation(r.id, cancelReason.trim());
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    setCancelling(false);
    setShowCancel(false);
    onAction();
  }

  return (
    <Card className={`border-border/50 shadow-sm overflow-hidden transition-colors ${
      isUrgent && tab === "new" ? "border-destructive/40 bg-destructive/[0.02]" : ""
    }`}>
      <CardContent className="pt-4 pb-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Client name + contact */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-semibold text-foreground">{r.user.name}</span>
              {prefs.occasion && prefs.occasion !== "None" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                  <PartyPopper className="size-2.5" /> {prefs.occasion}
                </span>
              )}
            </div>

            {/* Date, time, guests */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><CalendarCheck className="size-3" /> {formattedDate}</span>
              <span className="flex items-center gap-1"><Clock className="size-3" /> {r.time}</span>
              <span className="flex items-center gap-1"><Users className="size-3" /> {r.guestCount} guest{r.guestCount !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Countdown for new requests */}
          {tab === "new" && r.responseDeadline && (
            <CountdownTimer
              deadline={r.responseDeadline}
              onExpire={onAction}
            />
          )}

          {/* Payment deadline for pending_payment */}
          {tab === "pending_payment" && r.paymentDeadline && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CreditCard className="size-3" />
              <CountdownTimer deadline={r.paymentDeadline} onExpire={onAction} />
            </div>
          )}
        </div>

        {/* Pre-order summary */}
        {prefs.preOrder && prefs.preOrder.length > 0 && (
          <div className="mt-2 px-2.5 py-2 rounded-lg bg-muted/40 text-xs">
            <span className="font-medium text-foreground">Pre-order: </span>
            <span className="text-muted-foreground">
              {prefs.preOrder.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
            </span>
            {prefs.estimatedTotal && (
              <span className="font-medium text-brand-orange ml-1">— {formatPrice(prefs.estimatedTotal)}</span>
            )}
          </div>
        )}

        {/* Special requests */}
        {prefs.notes && (
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Note: </span>
            {prefs.notes}
          </div>
        )}

        {/* Rejection reason */}
        {r.rejectionReason && (
          <div className="mt-2 px-2.5 py-2 rounded-lg bg-destructive/5 text-xs text-destructive">
            <span className="font-medium">Reason: </span>{r.rejectionReason}
          </div>
        )}

        {/* Cancellation reason */}
        {r.cancellationReason && (
          <div className="mt-2 px-2.5 py-2 rounded-lg bg-muted/40 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Cancelled: </span>{r.cancellationReason}
            {r.cancelledBy && <span> (by {r.cancelledBy.toLowerCase()})</span>}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
          {/* New: Accept / Reject */}
          {tab === "new" && !showReject && (
            <>
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
              >
                {accepting ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                Accept
              </button>
              <button
                onClick={() => setShowReject(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors"
              >
                <X className="size-3" />
                Reject
              </button>
            </>
          )}

          {/* Reject form */}
          {showReject && (
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {REJECT_REASONS.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRejectReason(reason)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                      rejectReason === reason
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : "border-border/60 text-muted-foreground hover:border-destructive/30"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              {rejectReason === "Other" && (
                <input
                  type="text"
                  value={rejectReason === "Other" ? "" : rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason..."
                  className="w-full h-8 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus:border-ring"
                />
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={rejecting || !rejectReason.trim()}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
                >
                  {rejecting ? <Loader2 className="size-3 animate-spin" /> : "Confirm Reject"}
                </button>
                <button onClick={() => { setShowReject(false); setRejectReason(""); }} className="px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Upcoming: Contact + Cancel */}
          {tab === "upcoming" && !showCancel && (
            <>
              <a
                href={`https://wa.me/${r.user.phone?.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                <MessageCircle className="size-3" />
                WhatsApp
              </a>
              <a
                href={`tel:${r.user.phone}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border/60 text-foreground hover:bg-muted/80 transition-colors"
              >
                <Phone className="size-3" />
                Call
              </a>
              <button
                onClick={() => setShowCancel(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors ml-auto"
              >
                Cancel Booking
              </button>
            </>
          )}

          {/* Cancel confirmed form */}
          {showCancel && (
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation..."
                className="w-full h-8 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus:border-ring"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  disabled={cancelling || !cancelReason.trim()}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
                >
                  {cancelling ? <Loader2 className="size-3 animate-spin" /> : "Confirm Cancel"}
                </button>
                <button onClick={() => { setShowCancel(false); setCancelReason(""); }} className="px-2 py-1.5 text-xs text-muted-foreground">
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
          >
            {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            {expanded ? "Less" : "Details"}
          </button>
        </div>

        {/* Expanded: client contact info */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/30 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-3" />
              <span>{r.user.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-foreground font-medium">Email:</span>
              <span>{r.user.email}</span>
            </div>
            {r.paidAt && (
              <div className="flex items-center gap-2 text-emerald-600">
                <Check className="size-3" />
                <span>Paid {formatPrice(r.bookingFee || 500)} on {new Date(r.paidAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
