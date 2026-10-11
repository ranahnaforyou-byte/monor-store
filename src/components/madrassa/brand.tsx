import Link from "next/link";
import { cn } from "@/lib/utils";

/** MA DRASSA palette (kept local: this is a separate brand from Hanout). */
export const MM = {
  blue: "#1F3C88",
  blueDeep: "#162C66",
  amber: "#F5A524",
  sky: "#F5F8FF",
  mint: "#0C8A64",
  coral: "#D63C37",
} as const;

/** Monogram: an open book whose spine draws an «M». */
export function MMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("h-8 w-8", className)}>
      <rect width="32" height="32" rx="9" fill={MM.blue} />
      <path d="M7 22V10l9 7 9-7v12" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 24.5c3-1.4 6-1.4 9 0 3-1.4 6-1.4 9 0" fill="none" stroke={MM.amber} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function MLogo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <MMark />
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-xl font-black tracking-tight", light ? "text-white" : "text-[#1F3C88]")}>MA DRASSA</span>
        <span className={cn("mt-0.5 text-[11px] font-semibold", light ? "text-white/70" : "text-[#1F3C88]/60")}>منظومة المدارس</span>
      </span>
    </span>
  );
}

export function MHeader({ active }: { active?: "home" | "demo" }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#1F3C88]/10 bg-[#F5F8FF]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/madrassa" aria-label="MA DRASSA — الرئيسية">
          <MLogo />
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {[
            ["/madrassa#roles", "لكل طرف لوحته"],
            ["/madrassa#links", "كيف ترتبط"],
            ["/madrassa#why", "لماذا MA DRASSA"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-full px-4 py-2 text-[15px] font-semibold text-[#1F3C88]/75 hover:text-[#1F3C88]">
              {label}
            </Link>
          ))}
        </nav>
        <Link
          href="/madrassa/demo"
          className={cn(
            "ms-auto inline-flex h-10 items-center rounded-full px-5 text-sm font-bold md:ms-0",
            active === "demo" ? "bg-[#F5A524] text-[#13294B]" : "bg-[#1F3C88] text-white hover:bg-[#162C66]",
          )}
        >
          جرّب المنظومة
        </Link>
      </div>
    </header>
  );
}

export function MFooter() {
  return (
    <footer className="border-t border-[#1F3C88]/10 bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-3 px-4 py-10 text-center sm:px-6 md:flex-row md:justify-between md:text-start lg:px-8">
        <div>
          <MLogo />
          <p className="mt-2 text-sm text-[#1F3C88]/60">منظومة واحدة للمدارس الخاصة ومراكز اللغات والدعم والتكوين المهني.</p>
        </div>
        <div className="flex flex-col items-center gap-1 md:items-end">
          <span className="rounded-full border border-[#1F3C88]/15 px-2.5 py-0.5 text-[11px] font-medium text-[#1F3C88]/60">بيانات تجريبية</span>
          <p className="text-xs text-[#1F3C88]/50">© {new Date().getFullYear()} MA DRASSA · الجزائر العاصمة · وهران</p>
        </div>
      </div>
    </footer>
  );
}
