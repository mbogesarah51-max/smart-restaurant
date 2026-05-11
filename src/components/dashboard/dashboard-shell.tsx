"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import type { SafeUser } from "@/types";

export function DashboardShell({
  user,
  children,
}: {
  user: SafeUser;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-brand-surface">
        <DashboardSidebar user={user} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardTopbar user={user} />
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
