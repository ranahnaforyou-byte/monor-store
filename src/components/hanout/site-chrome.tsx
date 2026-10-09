import Link from "next/link";
import { HanoutLogo, DemoTag } from "./logo";
import { HANOUT_CONTACT } from "@/config/hanout";

const NAV = [
  { href: "/#merchants", label: "للتجار" },
  { href: "/#crafts", label: "للحرفيين" },
  { href: "/#business", label: "للشركات" },
  { href: "/system", label: "النظام" },
];

export function SiteHeader({ active }: { active?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="حانوت — الرئيسية">
          <HanoutLogo />
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-full px-4 py-2 text-[15px] font-semibold transition-colors ${
                active === n.href ? "bg-brand-soft text-brand" : "text-ink-soft hover:text-ink"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-2 md:ms-0">
          <Link href="/team" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-ink-soft hover:text-ink sm:inline-flex">
            دخول الفريق
          </Link>
          <Link
            href="/#start"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
          >
            ابدأ الآن
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-4 px-4 py-10 text-center sm:px-6 md:flex-row md:justify-between md:text-start lg:px-8">
        <div>
          <HanoutLogo withLatin />
          <p className="mt-2 text-sm text-muted">كلّ واحد ودوره — نظام جزائري لترتيب الطلبات والفرق.</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={HANOUT_CONTACT.whatsapp} target="_blank" rel="noreferrer" className="rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white">
            WhatsApp
          </a>
          <a href={HANOUT_CONTACT.telegram} target="_blank" rel="noreferrer" className="rounded-full bg-[#229ED9] px-4 py-2 text-sm font-bold text-white">
            Telegram
          </a>
        </div>
        <div className="flex flex-col items-center gap-1 md:items-end">
          <DemoTag />
          <p className="text-xs text-muted">© {new Date().getFullYear()} حانوت · ECSEL Expo · الجزائر</p>
        </div>
      </div>
    </footer>
  );
}
