import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";
import { resolveCart } from "@/lib/cart/service";
import { CartView } from "@/components/store/cart-view";

export const metadata: Metadata = { title: "السلة", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const { t } = await getI18n();
  const cart = await resolveCart();

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-display text-2xl font-bold">{t("cart.title")}</h1>
      <CartView
        cart={cart}
        labels={{
          size: t("common.size"),
          remove: t("common.remove"),
          subtotal: t("common.subtotal"),
          checkout: t("cart.checkout"),
          empty: t("cart.empty"),
          emptyCta: t("cart.emptyCta"),
          outOfStock: t("common.outOfStock"),
          adjusted: t("common.lowStock"),
          estimatedShipping: t("cart.estimatedShipping"),
        }}
      />
    </div>
  );
}
