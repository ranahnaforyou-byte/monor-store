import Link from "next/link";
import { HanoutLogo, DemoTag } from "./logo";
import { LangToggle } from "./lang-toggle";
import { HANOUT_CONTACT } from "@/config/hanout";
import type { HnLang } from "@/lib/hanout/lang";

const T = {
  ar: {
    nav: [
      { href: "/#merchants", label: "للتجار" },
      { href: "/#crafts", label: "للحرفيين" },
      { href: "/#business", label: "للشركات" },
      { href: "/system", label: "النظام" },
    ],
    team: "دخول الفريق",
    start: "ابدأ الآن",
    home: "حانوت — الرئيسية",
    tagline: "كلّ واحد ودوره — نظام جزائري لترتيب الطلبات والفرق.",
    rights: "حانوت · ECSEL Expo · الجزائر",
  },
  en: {
    nav: [
      { href: "/#merchants", label: "Merchants" },
      { href: "/#crafts", label: "Artisans" },
      { href: "/#business", label: "Business" },
      { href: "/system", label: "The System" },
    ],
    team: "Team login",
    start: "Get started",
    home: "Hanout — home",
    tagline: "Everyone has a role — an Algerian system for orders and teams.",
    rights: "Hanout · ECSEL Expo · Algiers",
  },
} as const;

export function SiteHeader({ active, lang = "ar" }: { active?: string; lang?: HnLang }) {
  const t = T[lang];
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label={t.home}>
          <HanoutLogo withLatin={lang === "en"} />
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {t.nav.map((n) => (
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
          <LangToggle lang={lang} />
          <Link href="/team" className="hidden rounded-full px-3 py-2 text-sm font-semibold text-ink-soft hover:text-ink sm:inline-flex">
            {t.team}
          </Link>
          <Link
            href="/#start"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
          >
            {t.start}
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 ltr:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ lang = "ar" }: { lang?: HnLang }) {
  const t = T[lang];
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-4 px-4 py-10 text-center sm:px-6 md:flex-row md:justify-between md:text-start lg:px-8">
        <div>
          <HanoutLogo withLatin />
          <p className="mt-2 text-sm text-muted">{t.tagline}</p>
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
          <DemoTag lang={lang} />
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {t.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
