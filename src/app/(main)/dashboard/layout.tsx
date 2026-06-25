import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { getDinerNotifications } from "@/app/actions/notifications";
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

  const notifications = user.role === "CLIENT" ? await getDinerNotifications() : [];

  return (
    <DashboardShell user={user} notifications={notifications}>
      {children}
    </DashboardShell>
  );
}
