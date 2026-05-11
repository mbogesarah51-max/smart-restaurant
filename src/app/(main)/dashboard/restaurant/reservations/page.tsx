import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { getRestaurantByOwnerId } from "@/app/actions/restaurant";
import { RestaurantReservations } from "@/components/reservation/restaurant-reservations";

export default async function RestaurantReservationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "RESTAURANT_OWNER") redirect("/dashboard");

  const restaurant = await getRestaurantByOwnerId();
  if (!restaurant) redirect("/dashboard/restaurant/setup");

  return <RestaurantReservations restaurantId={restaurant.id} />;
}
