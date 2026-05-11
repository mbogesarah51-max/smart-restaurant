"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseReservationPollingOptions<T> {
  fetcher: () => Promise<T>;
  interval?: number; // ms, default 30s
  enabled?: boolean;
}

interface UseReservationPollingResult<T> {
  data: T | null;
  isLoading: boolean;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function useReservationPolling<T>({
  fetcher,
  interval = 30000,
  enabled = true,
}: UseReservationPollingOptions<T>): UseReservationPollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = useCallback(async () => {
    try {
      const result = await fetcherRef.current();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Polling fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    refresh();

    // Set up polling, pause when tab is inactive
    let timer: ReturnType<typeof setInterval> | null = null;

    function startPolling() {
      if (timer) clearInterval(timer);
      timer = setInterval(refresh, interval);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        refresh(); // Fetch immediately when tab becomes active
        startPolling();
      } else {
        if (timer) clearInterval(timer);
      }
    }

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, interval, refresh]);

  return { data, isLoading, lastUpdated, refresh };
}
