"use client";

import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "./store";

export const card = "rounded-[20px] border border-[#1F3C88]/10 bg-white";
export const input = "h-11 rounded-xl border border-[#1F3C88]/15 bg-white px-3 text-[15px] outline-none focus-visible:border-[#1F3C88] focus-visible:ring-2 focus-visible:ring-[#1F3C88]/20";
export const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A524] focus-visible:ring-offset-2";

/** Toast + clock shared by all views. */
export const DemoCtx = createContext<{ flash: (t: string) => void; now: number }>({ flash: () => {}, now: 0 });
export const useDemo = () => useContext(DemoCtx);

export function Btn({
  children, onClick, tone = "blue", size = "md", className, disabled, type = "button",
}: {
  children: ReactNode; onClick?: () => void; tone?: "blue" | "amber" | "green" | "ghost" | "red"; size?: "sm" | "md"; className?: string; disabled?: boolean; type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        focus,
        size === "sm" ? "h-9 px-3 text-[13px]" : "h-11 px-4 text-sm",
        tone === "blue" && "bg-[#1F3C88] text-white hover:bg-[#162C66]",
        tone === "amber" && "bg-[#F5A524] text-[#13294B] hover:bg-[#E89A14]",
        tone === "green" && "bg-[#0C8A64] text-white hover:bg-[#0A7554]",
        tone === "red" && "border border-[#D63C37]/30 bg-white text-[#C0322D] hover:bg-[#FDECEC]",
        tone === "ghost" && "border border-[#1F3C88]/15 bg-white text-[#1F3C88] hover:bg-[#F5F8FF]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Pill({ children, tone = "blue", className }: { children: ReactNode; tone?: "blue" | "amber" | "green" | "red" | "gray"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[12px] font-bold",
        tone === "blue" && "bg-[#E9EEFB] text-[#1F3C88]",
        tone === "amber" && "bg-[#FEF3DC] text-[#8A5A0B]",
        tone === "green" && "bg-[#E7F6EF] text-[#0A7554]",
        tone === "red" && "bg-[#FDECEC] text-[#B42F2A]",
        tone === "gray" && "bg-[#EEF1F7] text-[#13294B]/60",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Panel({ title, aside, children, className }: { title: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn(card, "p-4 sm:p-5", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-black">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

const STAT_TONE = {
  blue: { box: "border-[#1F3C88]/10 bg-white", ink: "text-[#1F3C88]", dot: "bg-[#E9EEFB] text-[#1F3C88]" },
  green: { box: "border-[#0C8A64]/15 bg-[#F0FAF5]", ink: "text-[#0A7554]", dot: "bg-[#DDF3E9] text-[#0A7554]" },
  red: { box: "border-[#D63C37]/15 bg-[#FFF5F4]", ink: "text-[#B42F2A]", dot: "bg-[#FDE3E1] text-[#B42F2A]" },
  amber: { box: "border-[#F5A524]/25 bg-[#FFFAF0]", ink: "text-[#8A5A0B]", dot: "bg-[#FEEFD0] text-[#8A5A0B]" },
};
const STAT_ICON = {
  people: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c.7-4 3.4-6 7-6s6.3 2 7 6M17 11a3 3 0 1 0 0-6M22 21c-.4-3-2-4.8-4.5-5.4",
  money: "M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  alert: "M12 8v5M12 17h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
  doc: "M6 3h9l4 4v14H6zM9 12h7M9 16h5",
};

export function Stat({ label, value, sub, tone = "blue", icon }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "blue" | "green" | "red" | "amber"; icon?: keyof typeof STAT_ICON }) {
  const t = STAT_TONE[tone];
  return (
    <div className={cn("flex items-start gap-3 rounded-[20px] border p-4", t.box)}>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[#13294B]/65">{label}</p>
        <p className={cn("num mt-1 font-display text-[22px] font-black leading-tight sm:text-[28px]", t.ink)}>{value}</p>
        {sub && <p className="mt-0.5 text-xs text-[#13294B]/55">{sub}</p>}
      </div>
      {icon && (
        <span className={cn("hidden h-11 w-11 shrink-0 items-center justify-center rounded-full sm:flex", t.dot)}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d={STAT_ICON[icon]} />
          </svg>
        </span>
      )}
    </div>
  );
}

/** One notification as a tinted timeline card (absence red, grade green, fee amber, school blue). */
const NOTE_META: Record<Tone, { title: string; box: string; ink: string }> = {
  absence: { title: "تنبيه غياب", box: "bg-[#FFF5F4] ring-[#D63C37]/15", ink: "text-[#B42F2A]" },
  grade: { title: "نقطة جديدة", box: "bg-[#F0FAF5] ring-[#0C8A64]/15", ink: "text-[#0A7554]" },
  fee: { title: "المستحقات", box: "bg-[#FFFAF0] ring-[#F5A524]/25", ink: "text-[#8A5A0B]" },
  announce: { title: "إعلان المؤسسة", box: "bg-[#F5F8FF] ring-[#1F3C88]/12", ink: "text-[#1F3C88]" },
  homework: { title: "واجب جديد", box: "bg-[#F5F8FF] ring-[#1F3C88]/12", ink: "text-[#1F3C88]" },
  request: { title: "التسجيل", box: "bg-[#FFFAF0] ring-[#F5A524]/25", ink: "text-[#8A5A0B]" },
  message: { title: "رسالة", box: "bg-[#F5F8FF] ring-[#1F3C88]/12", ink: "text-[#1F3C88]" },
  discipline: { title: "الانضباط", box: "bg-[#FFF5F4] ring-[#D63C37]/15", ink: "text-[#B42F2A]" },
  approval: { title: "قرار", box: "bg-[#F0FAF5] ring-[#0C8A64]/15", ink: "text-[#0A7554]" },
  schedule: { title: "استعمال الزمن", box: "bg-[#FFFAF0] ring-[#F5A524]/25", ink: "text-[#8A5A0B]" },
};

export function NoteCard({ tone, text, when, fresh }: { tone: Tone; text: string; when: string; fresh?: boolean }) {
  const m = NOTE_META[tone];
  return (
    <li className={cn("flex items-start gap-3 rounded-2xl p-3 ring-1", m.box, fresh && "anim-pop ring-2 ring-[#F5A524]")}>
      <ToneIcon tone={tone} className="bg-white" />
      <div className="min-w-0 flex-1">
        <p className={cn("text-[13px] font-black", m.ink)}>{m.title}</p>
        <p className="text-sm font-semibold leading-snug">{text}</p>
      </div>
      <span className="shrink-0 text-[11px] text-[#13294B]/50">{when}</span>
    </li>
  );
}

export function Avatar({ name, tone = "bg-[#E9EEFB] text-[#1F3C88]", className }: { name: string; tone?: string; className?: string }) {
  const p = name.replace(/^(أ\.|وليّ|وليّة)\s+/, "").split(" ");
  return <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold", tone, className)}>{(p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")}</span>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-[#1F3C88]/15 p-4 text-center text-sm text-[#13294B]/60">{children}</p>;
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: [T, string, number?][] }) {
  return (
    <div role="tablist" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {items.map(([k, l, n]) => (
        <button
          key={k}
          role="tab"
          aria-selected={value === k}
          type="button"
          onClick={() => onChange(k)}
          className={cn("inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold", focus, value === k ? "bg-[#13294B] text-white" : "bg-white text-[#1F3C88] ring-1 ring-[#1F3C88]/12")}
        >
          {l}
          {!!n && <span className={cn("num rounded-full px-1.5 text-[11px]", value === k ? "bg-[#F5A524] text-[#13294B]" : "bg-[#D63C37] text-white")}>{n}</span>}
        </button>
      ))}
    </div>
  );
}

const ICONS: Record<Tone, { c: string; d: string }> = {
  absence: { c: "bg-[#FDECEC] text-[#B42F2A]", d: "M12 8v5M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" },
  grade: { c: "bg-[#E7F6EF] text-[#0A7554]", d: "M4 19h16M7 15l3-3 3 3 5-6" },
  fee: { c: "bg-[#FEF3DC] text-[#8A5A0B]", d: "M3 7h18v10H3zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" },
  announce: { c: "bg-[#E9EEFB] text-[#1F3C88]", d: "M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1zM16 9a4 4 0 0 1 0 6" },
  homework: { c: "bg-[#E9EEFB] text-[#1F3C88]", d: "M4 19V5h12l4 4v10zM8 9h6M8 13h8" },
  request: { c: "bg-[#FEF3DC] text-[#8A5A0B]", d: "M9 11l3 3 8-8M20 12v7H4V5h11" },
  message: { c: "bg-[#E9EEFB] text-[#1F3C88]", d: "M4 5h16v11H8l-4 4z" },
  discipline: { c: "bg-[#FDECEC] text-[#B42F2A]", d: "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" },
  approval: { c: "bg-[#E7F6EF] text-[#0A7554]", d: "M20 6 9 17l-5-5" },
  schedule: { c: "bg-[#FEF3DC] text-[#8A5A0B]", d: "M4 6h16v14H4zM4 10h16M9 3v4M15 3v4" },
};

export function ToneIcon({ tone, className }: { tone: Tone; className?: string }) {
  return (
    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", ICONS[tone].c, className)}>
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={ICONS[tone].d} />
      </svg>
    </span>
  );
}

export function Stars({ n, size = "sm" }: { n: number; size?: "sm" | "lg" }) {
  return (
    <span className={cn("inline-flex items-center gap-1 font-bold text-[#B7791F]", size === "lg" ? "text-base" : "text-sm")} aria-label={`${n} من 5`}>
      <svg viewBox="0 0 24 24" className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} fill="currentColor" aria-hidden>
        <path d="m12 2 3 6.6 7 .7-5.3 4.7 1.6 7-6.3-3.8L5.7 21l1.6-7L2 9.3l7-.7z" />
      </svg>
      <span className="num">{n.toFixed(1)}</span>
    </span>
  );
}

/** Small header for each role: who you are, and where. */
export function RoleHead({ name, line, tone }: { name: string; line: string; tone?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} tone={tone} className="h-11 w-11 text-sm" />
      <div className="min-w-0">
        <p className="font-display text-xl font-black leading-tight">{name}</p>
        <p className="truncate text-[13px] text-[#13294B]/60">{line}</p>
      </div>
    </div>
  );
}
