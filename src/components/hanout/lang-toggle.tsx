"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

function writeLangCookie(l: "ar" | "en") {
  document.cookie = `hn_lang=${l}; path=/; max-age=31536000; samesite=lax`;
}

export function LangToggle({ lang, className }: { lang: "ar" | "en"; className?: string }) {
  const router = useRouter();
  const set = (l: "ar" | "en") => {
    writeLangCookie(l);
    router.refresh();
  };
  return (
    <div className={cn("flex rounded-full border border-line bg-paper p-0.5 text-xs font-bold", className)} role="group" aria-label="Language">
      {(["ar", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => set(l)}
          aria-pressed={lang === l}
          className={cn("rounded-full px-2.5 py-1", lang === l ? "bg-brand text-white" : "text-muted hover:text-ink")}
        >
          {l === "ar" ? "ع" : "EN"}
        </button>
      ))}
    </div>
  );
}
