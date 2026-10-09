"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Live updates for demo pages. Polls the tiny `/api/live` change stamp every
 * `ms` while the tab is visible and re-renders the server route only when
 * something actually changed (new order, status change, chat message).
 * A full refresh still happens every `fullEveryMs` so relative times stay fresh.
 */
export function LiveRefresh({ ms = 2000, fullEveryMs = 60_000 }: { ms?: number; fullEveryMs?: number }) {
  const router = useRouter();
  const last = useRef<string | null>(null);
  const lastFull = useRef(0);

  useEffect(() => {
    let stopped = false;
    lastFull.current = Date.now();
    const tick = async () => {
      if (stopped || document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/live", { cache: "no-store" });
        const { stamp } = (await res.json()) as { stamp: string };
        const changed = last.current !== null && stamp !== last.current;
        last.current = stamp;
        if (changed || Date.now() - lastFull.current > fullEveryMs) {
          lastFull.current = Date.now();
          router.refresh();
        }
      } catch {
        /* offline for a moment — try again next tick */
      }
    };
    const id = window.setInterval(tick, ms);
    const onVisible = () => void tick();
    document.addEventListener("visibilitychange", onVisible);
    void tick();
    return () => {
      stopped = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, ms, fullEveryMs]);
  return null;
}
