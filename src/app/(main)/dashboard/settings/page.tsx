import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { SettingsPage } from "@/components/dashboard/settings-page";

export default async function Settings() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return <SettingsPage user={user} />;
}
