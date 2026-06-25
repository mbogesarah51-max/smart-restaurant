"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
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
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-brand-surface via-background to-brand-sand/30 dark:from-[#15110f] dark:via-[#181310] dark:to-[#211914]">
        <DashboardSidebar user={user} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardTopbar user={user} notifications={notifications} />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
        <div className="fixed bottom-5 right-5 z-50 rounded-full border border-border/70 bg-background/90 p-1 shadow-xl backdrop-blur-xl">
          <ThemeToggle compact />
        </div>
      </div>
    </TooltipProvider>
  );
}
