import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { getRestaurantByOwnerId } from "@/app/actions/restaurant";
import { getOwnerDashboardStats } from "@/app/actions/reservation";
import { OwnerDashboard } from "@/components/dashboard/owner-dashboard";

export default async function RestaurantDashboardPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");
  if (user.role !== "RESTAURANT_OWNER") redirect("/dashboard");

  const restaurant = await getRestaurantByOwnerId();

  if (!restaurant) {
    redirect("/dashboard/restaurant/setup");
  }

  const stats = await getOwnerDashboardStats();

  return <OwnerDashboard user={user} restaurant={restaurant} stats={stats} />;
}
