"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarCheck,
  Clock,
  CreditCard,
  Loader2,
  Lock,
  Phone,
  Smartphone,
  Users,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { IS_PAYMENT_SIMULATED, BOOKING_FEE } from "@/lib/config";
import { CountdownTimer } from "@/components/shared/countdown-timer";
import type { Reservation, Restaurant } from "@/generated/prisma/client";

type ReservationWithRestaurant = Reservation & {
  restaurant: Pick<Restaurant, "id" | "name" | "bannerImage" | "city">;
};

interface Props {
  reservation: ReservationWithRestaurant;
  userPhone: string;
  userEmail: string;
}

export function PaymentCheckout({ reservation, userPhone, userEmail }: Props) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [expired, setExpired] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mtn_momo");
  const [phone, setPhone] = useState(userPhone);

  const date = new Date(reservation.date);
  const formattedDate = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  // Check if already expired on mount
  useEffect(() => {
    if (reservation.paymentDeadline && new Date() > new Date(reservation.paymentDeadline)) {
      setExpired(true);
    }
  }, [reservation.paymentDeadline]);

  async function handlePay() {
    if (expired) return;
    setProcessing(true);

    try {
      // Step 1: Initialize payment (get reference)
      const initRes = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId: reservation.id }),
      });

      const initData = await initRes.json();
      if (!initRes.ok) {
        toast.error(initData.error || "Failed to initialize payment");
        setProcessing(false);
        return;
      }

      // Step 2: Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 3: Confirm payment
      const confirmRes = await fetch("/api/payments/confirm-simulated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: reservation.id,
          paymentReference: initData.reference,
        }),
      });

      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) {
        toast.error(confirmData.error || "Payment failed");
        setProcessing(false);
        return;
      }

      toast.success("Payment confirmed!");
      router.push(`/dashboard/reservations/${reservation.id}/payment-confirmed?ref=${initData.reference}`);
    } catch {
      toast.error("Something went wrong");
      setProcessing(false);
    }
  }

  const methods = [
    { id: "mtn_momo", label: "MTN Mobile Money", icon: Smartphone, color: "text-yellow-600" },
    { id: "orange_money", label: "Orange Money", icon: Smartphone, color: "text-orange-500" },
    { id: "card", label: "Card Payment", icon: CreditCard, color: "text-blue-600" },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Dev mode banner */}
      {IS_PAYMENT_SIMULATED && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Development Mode</p>
            <p className="text-xs text-amber-700">No real payment will be charged. This is a simulated payment for testing.</p>
          </div>
        </div>
      )}

      {/* Back */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard/reservations" className="flex items-center justify-center size-8 rounded-lg hover:bg-muted/80 transition-colors">
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-lg font-bold font-heading text-foreground">Complete Payment</h1>
      </div>

      {/* Payment deadline countdown */}
      {reservation.paymentDeadline && !expired && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-muted/50 border border-border/40">
          <span className="text-xs text-muted-foreground">Time remaining to pay</span>
          <CountdownTimer
            deadline={reservation.paymentDeadline}
            onExpire={() => setExpired(true)}
          />
        </div>
      )}

      {expired && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6 text-center space-y-3">
            <Clock className="size-8 text-destructive mx-auto" />
            <h3 className="font-semibold text-destructive">Payment Window Expired</h3>
            <p className="text-sm text-muted-foreground">Your reservation has been cancelled. You can try booking again.</p>
            <Link
              href={`/dashboard/restaurants/${reservation.restaurant.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-brand-orange hover:bg-brand-orange-hover text-white transition-colors"
            >
              Book Again
            </Link>
          </CardContent>
        </Card>
      )}

      {!expired && (
        <>
          {/* Order summary */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="pt-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Order Summary</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Restaurant</span>
                  <span className="font-medium text-foreground">{reservation.restaurant.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><CalendarCheck className="size-3" /> Date</span>
                  <span className="text-foreground">{formattedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><Clock className="size-3" /> Time</span>
                  <span className="text-foreground">{reservation.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><Users className="size-3" /> Guests</span>
                  <span className="text-foreground">{reservation.guestCount}</span>
                </div>
                <div className="border-t border-border/40 pt-2 flex justify-between">
                  <span className="font-semibold text-foreground">Booking Fee</span>
                  <span className="font-bold text-brand-orange">{formatPrice(BOOKING_FEE)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment method */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="pt-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Payment Method</h3>
              <div className="space-y-2">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg border transition-colors ${
                      paymentMethod === m.id
                        ? "border-brand-orange bg-brand-orange/5"
                        : "border-border/60 hover:border-brand-orange/30"
                    }`}
                  >
                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === m.id ? "border-brand-orange" : "border-border"
                    }`}>
                      {paymentMethod === m.id && <div className="size-2.5 rounded-full bg-brand-orange" />}
                    </div>
                    <m.icon className={`size-4 ${m.color}`} />
                    <span className="text-sm font-medium text-foreground">{m.label}</span>
                  </button>
                ))}
              </div>

              {(paymentMethod === "mtn_momo" || paymentMethod === "orange_money") && (
                <div className="mt-4 space-y-2">
                  <Label className="text-xs">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-9"
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 shadow-md shadow-emerald-600/20"
            >
              {processing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processing payment...
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  Pay {formatPrice(BOOKING_FEE)}
                </>
              )}
            </button>
            <Link
              href="/dashboard/reservations"
              className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            >
              Cancel
            </Link>
          </div>

          <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
            <Lock className="size-2.5" />
            {IS_PAYMENT_SIMULATED ? "Simulated — no real charges" : "Secured by " + paymentMethod}
          </p>
        </>
      )}
    </div>
  );
}
