import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import prisma from "@/lib/prisma";
import { PaymentConfirmed } from "@/components/reservation/payment-confirmed";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function PaymentConfirmedPage({ params, searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;
  const sp = await searchParams;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      restaurant: { select: { name: true, slug: true, bannerImage: true, city: true } },
    },
  });

  if (!reservation || reservation.userId !== user.id) notFound();

  return (
    <PaymentConfirmed
      reservation={reservation}
      reference={sp.ref || reservation.paymentReference || ""}
    />
  );
}
