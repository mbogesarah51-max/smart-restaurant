"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import type { SafeUser } from "@/types";
import type { DinerNotification } from "@/app/actions/notifications";

export function DashboardShell({
  user,
  notifications,
  children,
}: {
  user: SafeUser;
  notifications: DinerNotification[];
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-brand-surface via-background to-brand-sand/30">
        <DashboardSidebar user={user} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardTopbar user={user} notifications={notifications} />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
