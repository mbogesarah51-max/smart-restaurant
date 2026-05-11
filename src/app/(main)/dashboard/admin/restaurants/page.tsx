import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { AdminRestaurantsPage } from "@/components/admin/admin-restaurants";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "ADMIN") redirect("/dashboard");

  return <AdminRestaurantsPage />;
}
