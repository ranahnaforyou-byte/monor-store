import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";
import { getStoreSettings } from "@/server/services/settings";
import { listCategories } from "@/server/services/catalog";

export async function Footer() {
  const { t, locale } = await getI18n();
  const [settings, categories] = await Promise.all([getStoreSettings(), listCategories()]);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <p className="font-display text-lg font-extrabold">
            MONOR<span className="text-brand"> STORE</span>
          </p>
          <p className="mt-3 max-w-sm text-sm text-muted">{t("footer.aboutText")}</p>
          {settings.contactPhone && (
            <p className="mt-3 text-sm text-ink-soft">
              {t("footer.contact")}: <span className="num">{settings.contactPhone}</span>
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">{t("nav.categories")}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link href={`/categories/${c.slug}`} className="hover:text-ink">
                  {locale === "fr" && c.nameFr ? c.nameFr : c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">{t("footer.help")}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/shipping" className="hover:text-ink">{t("footer.shipping")}</Link></li>
            <li><Link href="/returns" className="hover:text-ink">{t("footer.returns")}</Link></li>
            <li><Link href="/contact" className="hover:text-ink">{t("footer.contact")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[1200px] px-4 py-4 text-center text-xs text-muted sm:px-6 lg:px-8">
          © {year} MONOR STORE — {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
