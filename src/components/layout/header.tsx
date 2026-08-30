import Link from "next/link";
import { MobileNav } from "./mobile-nav";
import { getI18n } from "@/lib/i18n/server";
import { listCategories } from "@/server/services/catalog";
import { resolveCart } from "@/lib/cart/service";
import { primaryNav } from "@/config/nav";

export async function Header() {
  const { t, locale } = await getI18n();
  const [categories, cart] = await Promise.all([listCategories(), resolveCart()]);

  const primary = primaryNav.map((n) => ({ label: t(n.labelKey), href: n.href }));
  const catItems = categories
    .filter((c) => c._count.products > 0)
    .map((c) => ({
      label: locale === "fr" && c.nameFr ? c.nameFr : c.name,
      href: `/categories/${c.slug}`,
    }));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-[var(--header-h)] max-w-[1200px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <MobileNav
          primary={[...primary, ...catItems]}
          categories={catItems}
          labels={{ menu: t("nav.menu"), close: t("nav.close"), categories: t("nav.categories") }}
        />

        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-extrabold tracking-tight text-ink">
            MONOR<span className="text-brand"> STORE</span>
          </span>
        </Link>

        <nav className="mx-4 hidden items-center gap-1 text-sm md:flex">
          {primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[var(--radius)] px-3 py-2 font-medium text-ink-soft hover:bg-surface hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          {catItems.length > 0 && (
            <div className="group relative">
              <button className="rounded-[var(--radius)] px-3 py-2 font-medium text-ink-soft hover:bg-surface hover:text-ink">
                {t("nav.categories")}
              </button>
              <div className="invisible absolute start-0 top-full z-50 min-w-48 rounded-[var(--radius)] border border-line bg-paper p-1 opacity-0 shadow-[var(--shadow-md)] transition-opacity group-hover:visible group-hover:opacity-100">
                {catItems.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="block rounded-[var(--radius-sm)] px-3 py-2 text-sm text-ink-soft hover:bg-surface"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="ms-auto flex items-center gap-1">
          <Link
            href="/search"
            aria-label={t("nav.search")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius)] text-ink hover:bg-surface"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>
          <Link
            href="/cart"
            aria-label={t("nav.cart")}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius)] text-ink hover:bg-surface"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 7h12l-1 13H7L6 7Zm3 0a3 3 0 1 1 6 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {cart.itemCount > 0 && (
              <span className="num absolute -top-0.5 -end-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-brand-ink">
                {cart.itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
