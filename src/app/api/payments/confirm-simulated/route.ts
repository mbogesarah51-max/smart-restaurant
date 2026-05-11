// TODO: Replace this route with a webhook handler from your real payment provider.
// When using NotchPay/CinetPay/MTN MoMo, the provider sends a POST to your webhook
// URL after payment completes. This simulated route mimics that behavior.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { confirmSimulatedPayment } from "@/lib/services/payment";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { reservationId, paymentReference } = await req.json();

    if (!reservationId || !paymentReference) {
      return NextResponse.json({ error: "Missing reservationId or paymentReference" }, { status: 400 });
    }

    // Verify ownership
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
    if (!reservation || reservation.userId !== user.id) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    const result = await confirmSimulatedPayment(reservationId, paymentReference);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error("Confirm simulated payment error:", error);
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
}
