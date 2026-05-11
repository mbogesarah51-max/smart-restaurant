import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { getRestaurantByOwnerId } from "@/app/actions/restaurant";
import { RestaurantEditPage } from "@/components/restaurant/edit-page";

export default async function EditRestaurantPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "RESTAURANT_OWNER") redirect("/dashboard");

  const restaurant = await getRestaurantByOwnerId();
  if (!restaurant) redirect("/dashboard/restaurant/setup");

  return <RestaurantEditPage restaurant={restaurant} />;
}
