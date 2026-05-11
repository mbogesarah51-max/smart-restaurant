import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { ClientDashboard } from "@/components/dashboard/client-dashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/sign-in");
  if (user.role === "RESTAURANT_OWNER") redirect("/dashboard/restaurant");
  if (user.role === "ADMIN") redirect("/dashboard/admin");

  return <ClientDashboard user={user} />;
}
