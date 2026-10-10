import { cn } from "@/lib/utils";

/** The Hanout shop-front mark: an awning over a door. */
export function HanoutMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("h-8 w-8", className)} fill="currentColor">
      <path d="M6.2 3.5h19.6c.6 0 1.1.3 1.4.8l2.6 6.2H2.2l2.6-6.2c.3-.5.8-.8 1.4-.8z" />
      <circle cx="5.6" cy="11" r="3.4" />
      <circle cx="12.2" cy="11" r="3.4" />
      <circle cx="19.8" cy="11" r="3.4" />
      <circle cx="26.4" cy="11" r="3.4" />
      <path d="M4.5 14.5h23v11.3a2.7 2.7 0 0 1-2.7 2.7H7.2a2.7 2.7 0 0 1-2.7-2.7z" />
      <rect x="12.6" y="18.2" width="6.8" height="10.3" rx="1.4" fill="var(--paper)" />
    </svg>
  );
}

export function HanoutLogo({
  className,
  withLatin = false,
  size = "md",
}: {
  className?: string;
  withLatin?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const s = { sm: ["h-6 w-6", "text-xl"], md: ["h-8 w-8", "text-2xl"], lg: ["h-11 w-11", "text-4xl"] }[size];
  return (
    <span className={cn("inline-flex items-center gap-2 text-brand", className)}>
      <HanoutMark className={s[0]} />
      <span className="flex flex-col leading-none">
        <span className={cn("font-display font-black tracking-tight", s[1])}>حانوت</span>
        {withLatin && <span className="mt-0.5 text-[11px] font-medium text-brand/70">Hanout</span>}
      </span>
    </span>
  );
}

/** Saffron brush stroke drawn under a headline word. */
export function Swash({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 24"
      preserveAspectRatio="none"
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 -bottom-2 h-[0.32em] w-full text-saffron", className)}
    >
      <path
        d="M4 16 C 70 6, 150 4, 296 10 C 210 12, 120 14, 20 21 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function DemoTag({ className, lang = "ar" }: { className?: string; lang?: "ar" | "en" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] font-medium text-muted",
        className,
      )}
    >
      {lang === "en" ? "Demo data" : "بيانات تجريبية"}
    </span>
  );
}
