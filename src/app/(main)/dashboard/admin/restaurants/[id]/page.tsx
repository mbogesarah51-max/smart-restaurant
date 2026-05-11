import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { getAdminRestaurantDetail } from "@/app/actions/admin";
import { AdminRestaurantReview } from "@/components/admin/admin-restaurant-review";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const restaurant = await getAdminRestaurantDetail(id);
  if (!restaurant) notFound();

  return <AdminRestaurantReview restaurant={restaurant} />;
}
