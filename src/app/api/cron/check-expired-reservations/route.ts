// Called every minute by Vercel Cron Jobs (or external scheduler).
// Handles two types of expiry:
// 1. AWAITING_RESPONSE past responseDeadline → CANCELLED (restaurant didn't respond)
// 2. PAYMENT_PENDING past paymentDeadline → CANCELLED (client didn't pay)

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent external abuse
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  try {
    // 1. Cancel expired AWAITING_RESPONSE reservations
    const expiredResponses = await prisma.reservation.updateMany({
      where: {
        status: "AWAITING_RESPONSE",
        responseDeadline: { lt: now },
      },
      data: {
        status: "CANCELLED",
        cancelledBy: "SYSTEM",
        cancellationReason: "Restaurant did not respond within the deadline",
      },
    });

    // 2. Cancel expired PAYMENT_PENDING reservations
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

    // TODO: Send notifications for each cancelled reservation
    // For now just log
    if (expiredResponses.count > 0) {
      console.log(`[Cron] Cancelled ${expiredResponses.count} expired response(s)`);
    }
    if (expiredPayments.count > 0) {
      console.log(`[Cron] Cancelled ${expiredPayments.count} expired payment(s)`);
    }

    return NextResponse.json({
      success: true,
      expired: {
        responses: expiredResponses.count,
        payments: expiredPayments.count,
      },
    });
  } catch (error) {
    console.error("Cron check-expired error:", error);
    return NextResponse.json({ error: "Failed to check expired reservations" }, { status: 500 });
  }
}
