"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size={compact ? "icon-sm" : "default"}
        className={compact ? "shrink-0" : "gap-2 rounded-xl"}
        aria-label="Change color theme"
        disabled
      >
        <Sun className="size-4" />
        {!compact && <span>Theme</span>}
      </Button>
    );
  }

  const dark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size={compact ? "icon-sm" : "default"}
      className={compact ? "shrink-0" : "gap-2 rounded-xl"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      {!compact && <span>{dark ? "Light mode" : "Dark mode"}</span>}
    </Button>
  );
}
