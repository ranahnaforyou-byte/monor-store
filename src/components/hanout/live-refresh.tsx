"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-renders the current server route every `ms` while the tab is visible. */
export function LiveRefresh({ ms = 2000 }: { ms?: number }) {
  const router = useRouter();
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const id = window.setInterval(tick, ms);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [router, ms]);
  return null;
}
