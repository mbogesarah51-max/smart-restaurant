import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { MyReservations } from "@/components/reservation/my-reservations";

export default async function ReservationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return <MyReservations />;
}
