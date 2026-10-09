"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ReactNode> = {
  dashboard: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  orders: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4.5V3h6v1.5M9 10h6M9 14h6M9 18h3" />
    </>
  ),
  chat: <path d="M21 12a8 8 0 0 1-11.8 7L4 20l1.2-4.6A8 8 0 1 1 21 12z" />,
  team: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" />
      <circle cx="17.5" cy="9" r="2.4" />
      <path d="M16 14.6c3 .2 4.9 1.9 5.5 5.4" />
    </>
  ),
  me: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.8-4.2 3.9-6.5 8-6.5s7.2 2.3 8 6.5" />
    </>
  ),
};

export function TabBar({ lead, badge }: { lead: boolean; badge: number }) {
  const path = usePathname();
  const tabs = [
    ...(lead ? [{ href: "/team/dashboard", key: "dashboard", label: "اللوحة" }] : []),
    { href: "/team/orders", key: "orders", label: "الطلبات" },
    { href: "/team/chat", key: "chat", label: "الجروب" },
    { href: "/team/staff", key: "team", label: "الفريق" },
    { href: "/team/me", key: "me", label: "أنا" },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="flex">
        {tabs.map((t) => {
          const active = path.startsWith(t.href);
          return (
            <li key={t.key} className="flex-1">
              <Link
                href={t.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors",
                  active ? "text-brand" : "text-muted hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                    active && "bg-brand-soft",
                  )}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {ICONS[t.key]}
                  </svg>
                </span>
                {t.label}
                {t.key === "orders" && badge > 0 && (
                  <span className="num absolute top-1 start-1/2 ms-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-strong px-1 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
