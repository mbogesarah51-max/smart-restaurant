"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  deadline: Date | string;
  onExpire?: () => void;
  className?: string;
}

export function CountdownTimer({ deadline, onExpire, className = "" }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() => getRemaining(deadline));

  useEffect(() => {
    const interval = setInterval(() => {
      const r = getRemaining(deadline);
      setRemaining(r);
      if (r.total <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline, onExpire]);

  if (remaining.total <= 0) {
    return <span className={`text-destructive font-medium text-sm ${className}`}>Expired</span>;
  }

  const isUrgent = remaining.total < 120000; // under 2 min
  const isCritical = remaining.total < 60000; // under 1 min

  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-mono font-medium tabular-nums ${
      isCritical
        ? "text-destructive animate-pulse"
        : isUrgent
          ? "text-destructive"
          : "text-amber-600"
    } ${className}`}>
      <Clock className="size-3.5" />
      {String(remaining.minutes).padStart(2, "0")}:{String(remaining.seconds).padStart(2, "0")}
    </span>
  );
}

function getRemaining(deadline: Date | string) {
  const end = new Date(deadline).getTime();
  const total = Math.max(0, end - Date.now());
  return {
    total,
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}
