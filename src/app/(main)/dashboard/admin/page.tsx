import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { getAdminStats } from "@/app/actions/admin";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const stats = await getAdminStats();
  if (!stats) redirect("/dashboard");

  return <AdminDashboard user={user} stats={stats} />;
}
