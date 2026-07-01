import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { AdminAnalyticsPage } from "@/components/admin/admin-analytics";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "ADMIN") redirect("/dashboard");

  return <AdminAnalyticsPage />;
}
