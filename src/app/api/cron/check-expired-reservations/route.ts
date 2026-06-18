// Called frequently by Vercel Cron Jobs (or an external scheduler).
// Handles two things:
// 1. AWAITING_RESPONSE past responseDeadline with no reminder yet → send the
//    restaurant a WhatsApp reminder (once). The request is NEVER auto-cancelled
//    for non-response — it stays open until the owner acts or the guest cancels.
// 2. PAYMENT_PENDING past paymentDeadline → CANCELLED (client didn't pay).

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  sendWhatsAppMessage,
  buildReservationReminderMessage,
  getAppUrl,
} from "@/lib/services/whatsapp";

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent external abuse
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  try {
    // 1. Remind restaurants about still-unanswered requests (no auto-cancel).
    //    Only those past their reminder time that haven't been reminded yet.
    const needReminder = await prisma.reservation.findMany({
      where: {
        status: "AWAITING_RESPONSE",
        reminderSentAt: null,
        responseDeadline: { lt: now },
      },
      include: {
        user: { select: { name: true } },
        restaurant: { select: { name: true, phone: true, whatsapp: true } },
      },
    });

    for (const r of needReminder) {
      // Mark as reminded first so a slow/duplicate cron run can't double-send.
      await prisma.reservation.update({
        where: { id: r.id },
        data: { reminderSentAt: now },
      });

      const to = r.restaurant.whatsapp ?? r.restaurant.phone;
      if (!to) continue;
      sendWhatsAppMessage(
        to,
        buildReservationReminderMessage(
          r.user.name,
          r.date,
          r.time,
          r.guestCount,
          r.restaurant.name,
          getAppUrl("/dashboard/restaurant/reservations")
        )
      ).catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[Cron] reminder ${r.id} failed: ${msg}`);
      });
    }

    // 2. Cancel expired PAYMENT_PENDING reservations (client didn't pay).
    const expiredPayments = await prisma.reservation.updateMany({
      where: {
        status: "PAYMENT_PENDING",
        paymentDeadline: { lt: now },
      },
      data: {
        status: "CANCELLED",
        cancelledBy: "SYSTEM",
        cancellationReason: "Client did not complete payment within the deadline",
      },
    });

    if (needReminder.length > 0) {
      console.log(`[Cron] Sent ${needReminder.length} response reminder(s)`);
    }
    if (expiredPayments.count > 0) {
      console.log(`[Cron] Cancelled ${expiredPayments.count} expired payment(s)`);
    }

    return NextResponse.json({
      success: true,
      remindersSent: needReminder.length,
      expiredPayments: expiredPayments.count,
    });
  } catch (error) {
    console.error("Cron check-expired error:", error);
    return NextResponse.json({ error: "Failed to check expired reservations" }, { status: 500 });
  }
}
