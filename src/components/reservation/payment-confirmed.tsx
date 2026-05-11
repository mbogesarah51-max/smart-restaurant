"use client";

import Link from "next/link";
import {
  CheckCircle2,
  CalendarCheck,
  Clock,
  Users,
  Search,
} from "lucide-react";
import { BOOKING_FEE } from "@/lib/config";
import { PaymentReceipt } from "@/components/shared/payment-receipt";
import type { Reservation, Restaurant } from "@/generated/prisma/client";

type ReservationWithRestaurant = Reservation & {
  restaurant: Pick<Restaurant, "name" | "slug" | "bannerImage" | "city">;
};

interface Props {
  reservation: ReservationWithRestaurant;
  reference: string;
}

export function PaymentConfirmed({ reservation, reference }: Props) {
  const isSuccess = reservation.status === "CONFIRMED";
  const date = new Date(reservation.date);
  const formattedDate = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  if (!isSuccess) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mx-auto">
          <span className="text-3xl">✕</span>
        </div>
        <h2 className="text-lg font-semibold text-destructive">Payment Could Not Be Completed</h2>
        <p className="text-sm text-muted-foreground">
          Something went wrong with your payment. You can try again or cancel.
        </p>
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href={`/dashboard/reservations/${reservation.id}/pay`}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-brand-orange hover:bg-brand-orange-hover text-white transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/dashboard/reservations"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Reservations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Success header */}
      <div className="text-center py-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-4 animate-in zoom-in duration-500">
          <CheckCircle2 className="size-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold font-heading text-foreground">Reservation Confirmed!</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your table at <span className="font-medium text-foreground">{reservation.restaurant.name}</span> is booked
        </p>
      </div>

      {/* Reservation summary */}
      <div className="rounded-xl border border-border/50 bg-white p-4 space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarCheck className="size-4 text-brand-orange" />
          <span className="text-foreground font-medium">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="size-4 text-brand-orange" />
          <span className="text-foreground font-medium">{reservation.time}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="size-4 text-brand-orange" />
          <span className="text-foreground font-medium">{reservation.guestCount} guest{reservation.guestCount !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Payment receipt */}
      <PaymentReceipt
        amount={reservation.bookingFee || BOOKING_FEE}
        reference={reference}
        method={reservation.paymentMethod || "simulated"}
        date={reservation.paidAt?.toISOString() || reservation.updatedAt.toISOString()}
        status="success"
        restaurantName={reservation.restaurant.name}
      />

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <Link
          href="/dashboard/reservations"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-brand-orange hover:bg-brand-orange-hover text-white transition-colors"
        >
          <CalendarCheck className="size-4" />
          View My Reservations
        </Link>
        <Link
          href="/dashboard/explore"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
        >
          <Search className="size-4" />
          Explore More Restaurants
        </Link>
      </div>
    </div>
  );
}
