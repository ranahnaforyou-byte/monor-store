"use client";

import { useEffect, useRef, useState } from "react";
import { buzz, playChime, unlockAudio } from "./chime";

type Item = { ref: string; label: string };

/**
 * Watches the list of "new" orders the server renders on every refresh and
 * rings + vibrates + shows a coral banner when a reference appears that this
 * device hasn't seen yet.
 */
export function NewOrderAlert({ items, storageKey = "hn-seen" }: { items: Item[]; storageKey?: string }) {
  const seen = useRef<Set<string> | null>(null);
  const [banner, setBanner] = useState<Item | null>(null);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      setSoundOn(true);
    };
    window.addEventListener("pointerdown", unlock);
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  useEffect(() => {
    if (seen.current === null) {
      // First render on this device: everything already listed is "old".
      let stored: string[] = [];
      try {
        stored = JSON.parse(sessionStorage.getItem(storageKey) ?? "[]");
      } catch {
        stored = [];
      }
      seen.current = new Set([...stored, ...items.map((i) => i.ref)]);
    } else {
      const fresh = items.filter((i) => !seen.current!.has(i.ref));
      if (fresh.length) {
        fresh.forEach((i) => seen.current!.add(i.ref));
        setBanner(fresh[0]);
        playChime();
        buzz();
        const t = window.setTimeout(() => setBanner(null), 5000);
        return () => window.clearTimeout(t);
      }
    }
    try {
      sessionStorage.setItem(storageKey, JSON.stringify([...seen.current]));
    } catch {
      /* private mode */
    }
  }, [items, storageKey]);

  return (
    <>
      {banner && (
        <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3">
          <div
            role="status"
            className="anim-slide-down flex w-full max-w-[440px] items-center gap-3 rounded-2xl bg-coral-strong px-4 py-3 text-white shadow-[var(--shadow-lg)]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold">طلب جديد وصل للفريق</p>
              <p className="truncate text-xs text-white/90">{banner.label}</p>
            </div>
          </div>
        </div>
      )}
      {!soundOn && (
        <button
          type="button"
          onClick={() => {
            unlockAudio();
            setSoundOn(true);
            playChime();
          }}
          className="fixed inset-x-0 bottom-[140px] z-40 mx-auto w-fit rounded-full bg-ink/90 px-4 py-2 text-xs font-semibold text-white shadow-[var(--shadow-md)]"
        >
          اضغط لتفعيل صوت التنبيه
        </button>
      )}
    </>
  );
}
