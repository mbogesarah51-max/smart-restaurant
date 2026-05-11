import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { AdminUsersPage } from "@/components/admin/admin-users";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "ADMIN") redirect("/dashboard");

  return <AdminUsersPage />;
}
