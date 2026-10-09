/** Arabic relative time: الآن · منذ 5 د · منذ 2 س · أمس */
export function timeAgo(date: Date | string, now = Date.now()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const s = Math.max(0, Math.round((now - d.getTime()) / 1000));
  if (s < 45) return "الآن";
  const m = Math.round(s / 60);
  if (m < 60) return `منذ ${m} د`;
  const h = Math.round(m / 60);
  if (h < 24) return `منذ ${h} س`;
  return "أمس";
}

export function clock(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Algiers" });
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

/** Department → Hanout accent */
export const DEPT_TONE: Record<string, { bg: string; fg: string; ring: string; label: string }> = {
  confirm: { bg: "bg-coral-soft", fg: "text-coral", ring: "ring-coral/30", label: "التأكيد" },
  prepare: { bg: "bg-saffron-soft", fg: "text-[#9a6d00]", ring: "ring-saffron/40", label: "التحضير" },
  ship: { bg: "bg-mint-soft", fg: "text-[#13855c]", ring: "ring-mint/40", label: "الشحن" },
  owner: { bg: "bg-brand-soft", fg: "text-brand", ring: "ring-brand/30", label: "المالك" },
  manager: { bg: "bg-surface-2", fg: "text-ink", ring: "ring-ink/20", label: "الإدارة" },
};

export function toneFor(user: { role: string; department?: { slug: string } | null }) {
  if (user.department?.slug) return DEPT_TONE[user.department.slug];
  return user.role === "OWNER" ? DEPT_TONE.owner : DEPT_TONE.manager;
}

/** Request-time clock for Server Components (each render is a fresh request). */
export function serverNow(): number {
  return Date.now();
}
