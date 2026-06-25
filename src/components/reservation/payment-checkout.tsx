"use client";

import { useEffect, useState } from "react";
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
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  useEffect(() => {
    if (reservation.paymentDeadline && new Date() > new Date(reservation.paymentDeadline)) {
      setExpired(true);
    }
  }, [reservation.paymentDeadline]);

  async function handlePay() {
    if (expired) return;
    setProcessing(true);

    try {
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

      await new Promise((resolve) => setTimeout(resolve, 2000));

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
    <div className="mx-auto max-w-lg space-y-6">
      {IS_PAYMENT_SIMULATED && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/25 dark:bg-amber-500/10">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Development Mode</p>
            <p className="text-xs text-amber-700 dark:text-amber-300/80">No real payment will be charged. This is a simulated payment for testing.</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Link href="/dashboard/reservations" className="flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-muted/80">
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="font-heading text-lg font-bold text-foreground">Complete Payment</h1>
      </div>

      {reservation.paymentDeadline && !expired && (
        <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/50 px-4 py-2.5">
          <span className="text-xs text-muted-foreground">Time remaining to pay</span>
          <CountdownTimer
            deadline={reservation.paymentDeadline}
            onExpire={() => setExpired(true)}
            invokeOnExpire
            expiredLabel="Payment window ended"
          />
        </div>
      )}

      {expired && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="space-y-3 pt-6 text-center">
            <Clock className="mx-auto size-8 text-destructive" />
            <h3 className="font-semibold text-destructive">Payment Window Expired</h3>
            <p className="text-sm text-muted-foreground">Your reservation has been cancelled. You can try booking again.</p>
            <Link
              href="/dashboard/explore"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-orange-hover"
            >
              Explore Restaurants
            </Link>
          </CardContent>
        </Card>
      )}

      {!expired && (
        <>
          <Card className="border-border/50 shadow-sm">
            <CardContent className="pt-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Order Summary</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Restaurant</span>
                  <span className="font-medium text-foreground">{reservation.restaurant.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground"><CalendarCheck className="size-3" /> Date</span>
                  <span className="text-foreground">{formattedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground"><Clock className="size-3" /> Time</span>
                  <span className="text-foreground">{reservation.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground"><Users className="size-3" /> Guests</span>
                  <span className="text-foreground">{reservation.guestCount}</span>
                </div>
                <div className="flex justify-between border-t border-border/40 pt-2">
                  <span className="font-semibold text-foreground">Booking Fee</span>
                  <span className="font-bold text-brand-orange">{formatPrice(BOOKING_FEE)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardContent className="pt-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Payment Method</h3>
              <div className="space-y-2">
                {methods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 transition-colors ${
                      paymentMethod === method.id
                        ? "border-brand-orange bg-brand-orange/5"
                        : "border-border/60 hover:border-brand-orange/30"
                    }`}
                  >
                    <div className={`flex size-5 items-center justify-center rounded-full border-2 ${
                      paymentMethod === method.id ? "border-brand-orange" : "border-border"
                    }`}>
                      {paymentMethod === method.id && <div className="size-2.5 rounded-full bg-brand-orange" />}
                    </div>
                    <method.icon className={`size-4 ${method.color}`} />
                    <span className="text-sm font-medium text-foreground">{method.label}</span>
                  </button>
                ))}
              </div>

              {(paymentMethod === "mtn_momo" || paymentMethod === "orange_money") && (
                <div className="mt-4 space-y-2">
                  <Label className="text-xs">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="pl-9"
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <button
              onClick={handlePay}
              disabled={processing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-colors hover:bg-emerald-700 disabled:opacity-50"
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
              className="flex w-full items-center justify-center rounded-xl border border-border/60 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            >
              Cancel
            </Link>
          </div>

          <p className="flex items-center justify-center gap-1 text-center text-[10px] text-muted-foreground">
            <Lock className="size-2.5" />
            {IS_PAYMENT_SIMULATED ? "Simulated — no real charges" : "Secured by " + paymentMethod}
          </p>
        </>
      )}
    </div>
  );
}
