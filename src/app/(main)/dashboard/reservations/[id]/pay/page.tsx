import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import prisma from "@/lib/prisma";
import { PaymentCheckout } from "@/components/reservation/payment-checkout";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PayPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      restaurant: { select: { id: true, name: true, bannerImage: true, city: true } },
    },
  });

  if (!reservation || reservation.userId !== user.id) notFound();
  if (reservation.status !== "PAYMENT_PENDING") redirect("/dashboard/reservations");

  return (
    <PaymentCheckout
      reservation={reservation}
      userPhone={user.phone}
      userEmail={user.email}
    />
  );
}
