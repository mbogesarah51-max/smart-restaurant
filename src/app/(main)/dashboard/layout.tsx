import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
