import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getI18n } from "@/lib/i18n/server";
import { resolveCart } from "@/lib/cart/service";
import { getStoreSettings } from "@/server/services/settings";
import { db } from "@/lib/db";
import { CheckoutForm } from "@/components/store/checkout-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "إتمام الطلب", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const { t, locale } = await getI18n();
  const [cart, settings] = await Promise.all([resolveCart(), getStoreSettings()]);
  const purchasable = cart.items.filter((i) => !i.unavailable);

  if (purchasable.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
        <p className="text-muted">{t("cart.empty")}</p>
        <Button asChild>
          <Link href="/products">{t("cart.emptyCta")}</Link>
        </Button>
      </div>
    );
  }

  const [wilayas, communes, rates] = await Promise.all([
    db.wilaya.findMany({ orderBy: { code: "asc" } }),
    db.commune.findMany({ orderBy: { name: "asc" } }),
    db.shippingRate.findMany({ where: { active: true } }),
  ]);

  const communesByWilaya: Record<number, { name: string; nameAr: string; hasStopDesk: boolean }[]> = {};
  for (const c of communes) {
    (communesByWilaya[c.wilayaCode] ??= []).push({
      name: c.name,
      nameAr: c.nameAr,
      hasStopDesk: c.hasStopDesk,
    });
  }

  const rateByCode = new Map(rates.map((r) => [r.wilayaCode, r]));
  const feeTable: Record<number, { home: number; stopDesk: number }> = {};
  for (const w of wilayas) {
    const r = rateByCode.get(w.code);
    feeTable[w.code] = {
      home: r?.toHome ?? settings.defaultHomeFee,
      stopDesk: r?.toStopDesk ?? settings.defaultStopDeskFee,
    };
  }

  if (!settings.codEnabled && !settings.baridimobEnabled) {
    redirect("/cart");
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 font-display text-2xl font-bold">{t("checkout.title")}</h1>
      <CheckoutForm
        cart={cart}
        wilayas={wilayas.map((w) => ({ code: w.code, name: w.name, nameAr: w.nameAr }))}
        communesByWilaya={communesByWilaya}
        feeTable={feeTable}
        freeShippingThreshold={settings.freeShippingThreshold}
        codEnabled={settings.codEnabled}
        baridimobEnabled={settings.baridimobEnabled}
        locale={locale}
        labels={{
          contact: t("checkout.contact"),
          fullName: t("checkout.fullName"),
          phone: t("checkout.phone"),
          email: t("checkout.email"),
          delivery: t("checkout.delivery"),
          wilaya: t("checkout.wilaya"),
          commune: t("checkout.commune"),
          address: t("checkout.address"),
          deliveryMode: t("checkout.deliveryMode"),
          toHome: t("checkout.toHome"),
          toStopDesk: t("checkout.toStopDesk"),
          notes: t("checkout.notes"),
          payment: t("checkout.payment"),
          cod: t("checkout.cod"),
          baridimob: t("checkout.baridimob"),
          placeOrder: t("checkout.placeOrder"),
          orderSummary: t("checkout.orderSummary"),
          processing: t("checkout.processing"),
          selectWilaya: t("checkout.selectWilaya"),
          selectCommune: t("checkout.selectCommune"),
          subtotal: t("common.subtotal"),
          shipping: t("common.shipping"),
          total: t("common.total"),
          free: t("common.free"),
          genericError: t("errors.generic"),
          phoneError: t("errors.invalidInput"),
          cartChanged: t("errors.outOfStock"),
        }}
      />
    </div>
  );
}
