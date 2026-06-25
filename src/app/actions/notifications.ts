"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export type DinerNotification = {
  id: string;
  title: string;
  message: string;
  href: string;
  createdAt: string;
  unread: boolean;
  tone: "info" | "success" | "warning" | "danger";
};

function formatReservationDate(date: Date, time: string) {
  const day = date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return `${day} at ${time}`;
}

export async function getDinerNotifications(limit = 8): Promise<DinerNotification[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "CLIENT") return [];

  const reservations = await prisma.reservation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: Math.max(1, Math.min(limit, 20)),
    include: {
      restaurant: {
        select: { name: true },
      },
    },
  });

  const unreadWindow = 7 * 24 * 60 * 60 * 1000;

  return reservations.map((reservation) => {
    const when = formatReservationDate(reservation.date, reservation.time);
    let title = "Reservation update";
    let message = `${reservation.restaurant.name} · ${when}`;
    let tone: DinerNotification["tone"] = "info";

    switch (reservation.status) {
      case "PENDING":
      case "AWAITING_RESPONSE":
        title = "Reservation request sent";
        message = `${reservation.restaurant.name} is reviewing your request for ${when}.`;
        tone = "info";
        break;
      case "ACCEPTED":
        title = "Restaurant accepted your request";
        message = `${reservation.restaurant.name} accepted your booking. Complete the 2,000 FCFA reservation fee to confirm it.`;
        tone = "success";
        break;
      case "PAYMENT_PENDING":
        title = "Reservation fee required";
        message = `Pay the 2,000 FCFA booking fee to confirm your table at ${reservation.restaurant.name}.`;
        tone = "warning";
        break;
      case "CONFIRMED":
        title = "Your table is confirmed";
        message = `${reservation.restaurant.name} · ${when}.`;
        tone = "success";
        break;
      case "REJECTED":
        title = "Reservation declined";
        message = `${reservation.restaurant.name} could not accept your request for ${when}.`;
        tone = "danger";
        break;
      case "CANCELLED":
        title = "Reservation cancelled";
        message = `${reservation.restaurant.name} · ${when}.`;
        tone = "danger";
        break;
    }

    return {
      id: reservation.id,
      title,
      message,
      href: "/dashboard/reservations",
      createdAt: reservation.updatedAt.toISOString(),
      unread: Date.now() - reservation.updatedAt.getTime() <= unreadWindow,
      tone,
    };
  });
}
