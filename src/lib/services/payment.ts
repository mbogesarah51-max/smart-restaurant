// ============================================================
// PAYMENT SERVICE — PLACEHOLDER IMPLEMENTATION
// ============================================================
// This is a simulated payment service for development/testing.
// To integrate a real payment provider:
//
// 1. Install the provider SDK (e.g., npm install notchpay-sdk)
// 2. Replace initializePayment() to call the provider's create-payment API
// 3. Replace verifyPayment() to call the provider's verify API
// 4. Add a webhook handler in /api/payments/webhook/route.ts
// 5. Set IS_PAYMENT_SIMULATED to false in lib/config.ts
// 6. Update env variables with real API keys
//
// The rest of the app (UI, status transitions, notifications)
// does NOT need to change — only this file.
// ============================================================

import { BOOKING_FEE, CURRENCY } from "@/lib/config";
import prisma from "@/lib/prisma";
import {
  sendWhatsAppMessage,
  buildReservationConfirmedMessage,
  getAppUrl,
} from "@/lib/services/whatsapp";

export interface InitializePaymentParams {
  amount: number;
  currency: string;
  email: string;
  phone: string;
  reservationId: string;
  description: string;
}

export interface InitializePaymentResult {
  paymentUrl: string;
  reference: string;
}

export interface VerifyPaymentResult {
  status: "success" | "failed" | "pending";
  reference: string;
  amount: number;
  paidAt?: Date;
}

export async function initializePayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResult> {
  // ── PLACEHOLDER ──────────────────────────────────────────────
  // Real provider: call their API to create a payment session
  // and return the redirect URL they give you.
  //
  // Example for NotchPay:
  //   const res = await fetch("https://api.notchpay.co/payments/initialize", {
  //     method: "POST",
  //     headers: { Authorization: `Bearer ${process.env.NOTCHPAY_SECRET_KEY}` },
  //     body: JSON.stringify({ amount, currency, email, phone, reference })
  //   });
  //   const data = await res.json();
  //   return { paymentUrl: data.authorization_url, reference: data.reference };
  // ─────────────────────────────────────────────────────────────

  const reference = `SIM_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;

  // Store reference in the reservation
  await prisma.reservation.update({
    where: { id: params.reservationId },
    data: { paymentReference: reference },
  });

  return {
    paymentUrl: `/dashboard/reservations/${params.reservationId}/pay`,
    reference,
  };
}

export async function verifyPayment(reference: string): Promise<VerifyPaymentResult> {
  // ── PLACEHOLDER ──────────────────────────────────────────────
  // Real provider: call their verify API
  //
  // Example for NotchPay:
  //   const res = await fetch(`https://api.notchpay.co/payments/${reference}`);
  //   const data = await res.json();
  //   return { status: data.status, reference, amount: data.amount, paidAt: data.paid_at };
  // ─────────────────────────────────────────────────────────────

  const reservation = await prisma.reservation.findFirst({
    where: { paymentReference: reference },
  });

  if (!reservation) {
    return { status: "failed", reference, amount: 0 };
  }

  if (reservation.paidAt) {
    return {
      status: "success",
      reference,
      amount: reservation.bookingFee || BOOKING_FEE,
      paidAt: reservation.paidAt,
    };
  }

  return {
    status: reservation.status === "CONFIRMED" ? "success" : "pending",
    reference,
    amount: reservation.bookingFee || BOOKING_FEE,
  };
}

export async function confirmSimulatedPayment(
  reservationId: string,
  reference: string
): Promise<{ success: boolean; message: string }> {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) {
    return { success: false, message: "Reservation not found" };
  }

  if (reservation.paymentReference !== reference) {
    return { success: false, message: "Invalid payment reference" };
  }

  if (reservation.status !== "PAYMENT_PENDING") {
    return { success: false, message: "Reservation is not awaiting payment" };
  }

  // Check payment deadline
  if (reservation.paymentDeadline && new Date() > reservation.paymentDeadline) {
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "CANCELLED" },
    });
    return { success: false, message: "Payment window has expired" };
  }

  const confirmed = await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: "CONFIRMED",
      paidAt: new Date(),
      paymentMethod: "simulated",
      bookingFee: BOOKING_FEE,
    },
    include: {
      user: { select: { name: true, phone: true } },
      restaurant: { select: { name: true, phone: true, whatsapp: true } },
    },
  });

  // Notify both parties on WhatsApp (fire-and-forget) — each gets their own action URL
  const buildMessage = (actionUrl: string) =>
    buildReservationConfirmedMessage(
      confirmed.restaurant.name,
      confirmed.user.name,
      confirmed.date,
      confirmed.time,
      confirmed.guestCount,
      actionUrl
    );

  const notify = (to: string | null | undefined, message: string, context: string) => {
    if (!to) return;
    sendWhatsAppMessage(to, message).catch((err) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[WhatsApp] ${context} failed: ${msg}`);
    });
  };

  notify(
    confirmed.user.phone,
    buildMessage(getAppUrl("/dashboard/reservations")),
    `payment-confirmed-client ${reservationId}`
  );
  notify(
    confirmed.restaurant.whatsapp ?? confirmed.restaurant.phone,
    buildMessage(getAppUrl("/dashboard/restaurant/reservations")),
    `payment-confirmed-owner ${reservationId}`
  );

  // TODO: Create in-app notifications

  return { success: true, message: "Payment confirmed! Reservation is now booked." };
}
