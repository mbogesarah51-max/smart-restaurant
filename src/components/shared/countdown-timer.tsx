"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  deadline: Date | string;
  onExpire?: () => void;
  className?: string;
  expiredLabel?: string;
}

export function CountdownTimer({
  deadline,
  onExpire,
  className = "",
  expiredLabel = "Expired",
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() => getRemaining(deadline));
  const onExpireRef = useRef(onExpire);
  const expiredCalledRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    expiredCalledRef.current = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    function update() {
      if (cancelled) return;

      const next = getRemaining(deadline);
      setRemaining(next);

      if (next.total <= 0) {
        if (!expiredCalledRef.current) {
          expiredCalledRef.current = true;
          onExpireRef.current?.();
        }
        return;
      }

      const delay = Math.max(80, Math.min(1000, (next.total % 1000) + 20));
      timer = setTimeout(update, delay);
    }

    update();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [deadline]);

  if (remaining.total <= 0) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground ${className}`}>
        <Clock className="size-3.5" />
        {expiredLabel}
      </span>
    );
  }

  const urgent = remaining.total < 120000;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-sm font-medium tabular-nums ${
        urgent ? "text-destructive" : "text-amber-600 dark:text-amber-400"
      } ${className}`}
      aria-live="off"
    >
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
    minutes: Math.floor(total / 1000 / 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}
