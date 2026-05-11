import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { BOOKING_FEE, CURRENCY, PAYMENT_TIMEOUT_MINUTES } from "@/lib/config";
import { initializePayment } from "@/lib/services/payment";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { reservationId } = await req.json();
    if (!reservationId) {
      return NextResponse.json({ error: "Reservation ID required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { restaurant: { select: { name: true } } },
    });

    if (!reservation || reservation.userId !== user.id) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    if (reservation.status !== "PAYMENT_PENDING") {
      return NextResponse.json({ error: "Reservation is not awaiting payment" }, { status: 400 });
    }

    // Set payment deadline if not already set
    if (!reservation.paymentDeadline) {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { paymentDeadline: new Date(Date.now() + PAYMENT_TIMEOUT_MINUTES * 60 * 1000) },
      });
    }

    const result = await initializePayment({
      amount: BOOKING_FEE,
      currency: CURRENCY,
      email: user.email,
      phone: user.phone,
      reservationId,
      description: `Booking fee for ${reservation.restaurant.name}`,
    });

    return NextResponse.json({
      success: true,
      paymentUrl: result.paymentUrl,
      reference: result.reference,
    });
  } catch (error) {
    console.error("Payment initialize error:", error);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}
