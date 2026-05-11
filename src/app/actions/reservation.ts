"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { reservationSchema } from "@/lib/validations";
import { RESPONSE_DEADLINE_MINUTES, BOOKING_FEE, PAYMENT_TIMEOUT_MINUTES } from "@/lib/config";
import { canTransitionTo } from "@/lib/reservation-status";
import {
  sendWhatsAppMessage,
  buildNewReservationMessage,
  buildReservationAcceptedMessage,
  buildReservationRejectedMessage,
  buildReservationCancelledMessage,
  getAppUrl,
} from "@/lib/services/whatsapp";
import type { ActionResponse } from "@/types";
import type { Reservation } from "@/generated/prisma/client";

function fireWhatsApp(to: string | null | undefined, message: string, context: string) {
  if (!to) return;
  sendWhatsAppMessage(to, message).catch((err) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[WhatsApp] ${context} failed: ${msg}`);
  });
}

export async function createReservation(
  input: {
    restaurantId: string;
    date: string;
    time: string;
    guestCount: number;
    occasion?: string;
    preferences?: string;
    preOrderItems?: { menuItemId: string; name: string; price: number; quantity: number }[];
  }
): Promise<ActionResponse<Reservation>> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: "Not authenticated" };

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return { success: false, message: "User not found" };

  const validated = reservationSchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { restaurantId, date, time, guestCount, occasion, preferences, preOrderItems } = validated.data;

  // Check restaurant exists and is active
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: { availabilitySlots: true },
  });

  if (!restaurant || !restaurant.isApproved || !restaurant.isActive) {
    return { success: false, message: "Restaurant is not available for reservations" };
  }

  // Check availability for the selected day
  const selectedDate = new Date(date);
  const dayOfWeek = (selectedDate.getDay() + 6) % 7; // JS Sunday=0 → Monday=0
  const slot = restaurant.availabilitySlots.find((s) => s.dayOfWeek === dayOfWeek && s.isActive);

  if (!slot) {
    return { success: false, message: "Restaurant is closed on this day" };
  }

  // Check time is within opening hours
  if (time < slot.openTime || time >= slot.closeTime) {
    return { success: false, message: `Restaurant is only open ${slot.openTime} – ${slot.closeTime} on this day` };
  }

  // Build preferences JSON
  const prefsData: Record<string, unknown> = {};
  if (occasion) prefsData.occasion = occasion;
  if (preferences) prefsData.notes = preferences;
  if (preOrderItems && preOrderItems.length > 0) {
    prefsData.preOrder = preOrderItems;
    prefsData.estimatedTotal = preOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  const responseDeadline = new Date(Date.now() + RESPONSE_DEADLINE_MINUTES * 60 * 1000);

  try {
    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        restaurantId,
        date: selectedDate,
        time,
        guestCount,
        preferences: Object.keys(prefsData).length > 0 ? JSON.stringify(prefsData) : null,
        status: "AWAITING_RESPONSE",
        responseDeadline,
        bookingFee: BOOKING_FEE,
      },
    });

    // Notify restaurant owner on WhatsApp (fire-and-forget)
    fireWhatsApp(
      restaurant.whatsapp ?? restaurant.phone,
      buildNewReservationMessage(
        user.name,
        selectedDate,
        time,
        guestCount,
        restaurant.name,
        getAppUrl("/dashboard/restaurant/reservations")
      ),
      `new-reservation ${reservation.id}`
    );

    return {
      success: true,
      message: "Reservation request sent!",
      data: reservation,
    };
  } catch (error) {
    console.error("Create reservation error:", error);
    return { success: false, message: "Failed to create reservation" };
  }
}

export async function getClientReservations(filters?: {
  status?: "upcoming" | "pending" | "past" | "cancelled";
}) {
  const { userId } = await auth();
  if (!userId) return [];

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return [];

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let where: Record<string, unknown> = { userId: user.id };

  switch (filters?.status) {
    case "upcoming":
      where = { ...where, status: "CONFIRMED", date: { gte: today } };
      break;
    case "pending":
      where = { ...where, status: { in: ["AWAITING_RESPONSE", "ACCEPTED", "PAYMENT_PENDING", "PENDING"] } };
      break;
    case "past":
      where = {
        ...where,
        OR: [
          { status: "CONFIRMED", date: { lt: today } },
        ],
      };
      break;
    case "cancelled":
      where = { ...where, status: { in: ["CANCELLED", "REJECTED"] } };
      break;
  }

  return prisma.reservation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      restaurant: {
        select: {
          id: true, name: true, slug: true, bannerImage: true,
          city: true, address: true, phone: true,
        },
      },
    },
  });
}

export async function cancelReservation(
  reservationId: string,
  reason?: string
): Promise<ActionResponse> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: "Not authenticated" };

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return { success: false, message: "User not found" };

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      restaurant: { select: { name: true, phone: true, whatsapp: true } },
    },
  });
  if (!reservation || reservation.userId !== user.id) {
    return { success: false, message: "Reservation not found" };
  }

  const cancellableStatuses = ["AWAITING_RESPONSE", "ACCEPTED", "PAYMENT_PENDING", "PENDING"];
  if (!cancellableStatuses.includes(reservation.status)) {
    return { success: false, message: "This reservation cannot be cancelled" };
  }

  try {
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: "CANCELLED",
        cancelledBy: "CLIENT",
        cancellationReason: reason || null,
      },
    });

    // Notify restaurant owner on WhatsApp (fire-and-forget)
    fireWhatsApp(
      reservation.restaurant.whatsapp ?? reservation.restaurant.phone,
      buildReservationCancelledMessage(
        reservation.restaurant.name,
        "CLIENT",
        reason || "No reason provided",
        getAppUrl("/dashboard/restaurant/reservations")
      ),
      `client-cancel ${reservationId}`
    );

    return { success: true, message: "Reservation cancelled" };
  } catch {
    return { success: false, message: "Failed to cancel reservation" };
  }
}

// ─── Restaurant Owner Actions ────────────────────────────────────────────────

async function getOwnerRestaurantId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "RESTAURANT_OWNER") return null;
  const restaurant = await prisma.restaurant.findFirst({
    where: { ownerId: user.id },
    select: { id: true },
  });
  return restaurant?.id ?? null;
}

export interface OwnerDashboardStats {
  awaitingResponse: number;
  paymentPending: number;
  confirmedUpcoming: number;
  confirmedToday: number;
  totalThisMonth: number;
  totalAllTime: number;
}

export async function getOwnerDashboardStats(): Promise<OwnerDashboardStats> {
  const restaurantId = await getOwnerRestaurantId();
  if (!restaurantId) return { awaitingResponse: 0, paymentPending: 0, confirmedUpcoming: 0, confirmedToday: 0, totalThisMonth: 0, totalAllTime: 0 };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [awaitingResponse, paymentPending, confirmedUpcoming, confirmedToday, totalThisMonth, totalAllTime] = await Promise.all([
    prisma.reservation.count({ where: { restaurantId, status: "AWAITING_RESPONSE" } }),
    prisma.reservation.count({ where: { restaurantId, status: "PAYMENT_PENDING" } }),
    prisma.reservation.count({ where: { restaurantId, status: "CONFIRMED", date: { gte: todayStart } } }),
    prisma.reservation.count({ where: { restaurantId, status: "CONFIRMED", date: { gte: todayStart, lt: todayEnd } } }),
    prisma.reservation.count({ where: { restaurantId, status: "CONFIRMED", createdAt: { gte: monthStart } } }),
    prisma.reservation.count({ where: { restaurantId } }),
  ]);

  return { awaitingResponse, paymentPending, confirmedUpcoming, confirmedToday, totalThisMonth, totalAllTime };
}

export async function getRestaurantReservations(filters?: {
  status?: "new" | "upcoming" | "pending_payment" | "past" | "cancelled";
}) {
  const restaurantId = await getOwnerRestaurantId();
  if (!restaurantId) return [];

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let where: Record<string, unknown> = { restaurantId };

  switch (filters?.status) {
    case "new":
      where = { ...where, status: "AWAITING_RESPONSE" };
      break;
    case "upcoming":
      where = { ...where, status: "CONFIRMED", date: { gte: today } };
      break;
    case "pending_payment":
      where = { ...where, status: "PAYMENT_PENDING" };
      break;
    case "past":
      where = { ...where, status: "CONFIRMED", date: { lt: today } };
      break;
    case "cancelled":
      where = { ...where, status: { in: ["CANCELLED", "REJECTED"] } };
      break;
  }

  return prisma.reservation.findMany({
    where,
    orderBy: filters?.status === "new"
      ? { responseDeadline: "asc" } // most urgent first
      : { date: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true, profileImage: true },
      },
    },
  });
}

export async function getNewReservationCount(): Promise<number> {
  const restaurantId = await getOwnerRestaurantId();
  if (!restaurantId) return 0;
  return prisma.reservation.count({
    where: { restaurantId, status: "AWAITING_RESPONSE" },
  });
}

export async function acceptReservation(reservationId: string): Promise<ActionResponse<Reservation>> {
  const restaurantId = await getOwnerRestaurantId();
  if (!restaurantId) return { success: false, message: "Restaurant not found" };

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      user: { select: { phone: true } },
      restaurant: { select: { name: true } },
    },
  });
  if (!reservation || reservation.restaurantId !== restaurantId) {
    return { success: false, message: "Reservation not found" };
  }

  if (!canTransitionTo(reservation.status, "PAYMENT_PENDING")) {
    return { success: false, message: `Cannot accept a reservation with status "${reservation.status}"` };
  }

  // Check deadline hasn't passed
  if (reservation.responseDeadline && new Date() > reservation.responseDeadline) {
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "CANCELLED", cancelledBy: "SYSTEM", cancellationReason: "Response deadline expired" },
    });
    return { success: false, message: "Response deadline has passed. Reservation was auto-cancelled." };
  }

  try {
    const paymentDeadline = new Date(Date.now() + PAYMENT_TIMEOUT_MINUTES * 60 * 1000);

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: "PAYMENT_PENDING",
        paymentDeadline,
        bookingFee: BOOKING_FEE,
      },
    });

    // Notify client on WhatsApp (fire-and-forget)
    fireWhatsApp(
      reservation.user.phone,
      buildReservationAcceptedMessage(
        reservation.restaurant.name,
        reservation.date,
        reservation.time,
        PAYMENT_TIMEOUT_MINUTES,
        getAppUrl(`/dashboard/reservations/${reservationId}/pay`)
      ),
      `accept-reservation ${reservationId}`
    );

    return { success: true, message: "Reservation accepted! Client has been notified to pay.", data: updated };
  } catch (error) {
    console.error("Accept reservation error:", error);
    return { success: false, message: "Failed to accept reservation" };
  }
}

export async function rejectReservation(
  reservationId: string,
  reason: string
): Promise<ActionResponse> {
  const restaurantId = await getOwnerRestaurantId();
  if (!restaurantId) return { success: false, message: "Restaurant not found" };

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      user: { select: { phone: true } },
      restaurant: { select: { name: true } },
    },
  });
  if (!reservation || reservation.restaurantId !== restaurantId) {
    return { success: false, message: "Reservation not found" };
  }

  if (!canTransitionTo(reservation.status, "REJECTED")) {
    return { success: false, message: `Cannot reject a reservation with status "${reservation.status}"` };
  }

  try {
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
      },
    });

    // Notify client on WhatsApp (fire-and-forget)
    fireWhatsApp(
      reservation.user.phone,
      buildReservationRejectedMessage(
        reservation.restaurant.name,
        reason,
        getAppUrl("/dashboard/explore")
      ),
      `reject-reservation ${reservationId}`
    );

    return { success: true, message: "Reservation rejected" };
  } catch {
    return { success: false, message: "Failed to reject reservation" };
  }
}

export async function cancelConfirmedReservation(
  reservationId: string,
  reason: string
): Promise<ActionResponse> {
  const restaurantId = await getOwnerRestaurantId();
  if (!restaurantId) return { success: false, message: "Restaurant not found" };

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      user: { select: { phone: true } },
      restaurant: { select: { name: true } },
    },
  });
  if (!reservation || reservation.restaurantId !== restaurantId) {
    return { success: false, message: "Reservation not found" };
  }

  if (!canTransitionTo(reservation.status, "CANCELLED")) {
    return { success: false, message: `Cannot cancel a reservation with status "${reservation.status}"` };
  }

  try {
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: "CANCELLED",
        cancelledBy: "RESTAURANT",
        cancellationReason: reason,
      },
    });

    // TODO: Trigger refund if payment was made

    // Notify client on WhatsApp (fire-and-forget)
    fireWhatsApp(
      reservation.user.phone,
      buildReservationCancelledMessage(
        reservation.restaurant.name,
        "RESTAURANT",
        reason,
        getAppUrl("/dashboard/reservations")
      ),
      `owner-cancel ${reservationId}`
    );

    return { success: true, message: "Reservation cancelled" };
  } catch {
    return { success: false, message: "Failed to cancel reservation" };
  }
}
