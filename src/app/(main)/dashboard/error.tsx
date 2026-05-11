"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 mb-4">
        <AlertCircle className="size-6 text-destructive" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">Something went wrong</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        An unexpected error occurred. Please try again or contact support if the issue persists.
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-orange hover:bg-brand-orange-hover text-white transition-colors"
      >
        <RotateCcw className="size-4" />
        Try Again
      </button>
    </div>
  );
}
