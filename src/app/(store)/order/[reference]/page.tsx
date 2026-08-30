import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";
import { getOrderByReference } from "@/server/services/order-lookup";
import { getStoreSettings } from "@/server/services/settings";
import { formatDZD } from "@/lib/money";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { BaridimobForm } from "@/components/store/baridimob-form";

export const metadata: Metadata = { title: "تتبع الطلب", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const { t, messages } = await getI18n();
  const order = await getOrderByReference(reference);
  if (!order) notFound();
  const settings = await getStoreSettings();

  const statusLabel = (messages.status as Record<string, string>)[order.status] ?? order.status;
  const payLabel =
    (messages.paymentStatus as Record<string, string>)[order.paymentStatus] ?? order.paymentStatus;

  return (
    <div className="mx-auto max-w-[720px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-brand-ink">
          ✓
        </div>
        <h1 className="font-display text-xl font-bold">{t("order.confirmedTitle")}</h1>
        <p className="mt-2 text-sm text-ink-soft">
          {t("order.confirmedBody").replace("{reference}", "")}
          <span className="num font-bold">{order.reference}</span>
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[var(--radius)] border border-line p-4">
          <p className="text-xs text-muted">{t("order.status")}</p>
          <p className="mt-1"><Badge variant="brand">{statusLabel}</Badge></p>
        </div>
        <div className="rounded-[var(--radius)] border border-line p-4">
          <p className="text-xs text-muted">{t("order.paymentStatus")}</p>
          <p className="mt-1">
            <Badge variant={order.paymentStatus === "PAID" ? "success" : "warning"}>{payLabel}</Badge>
          </p>
        </div>
      </div>

      {order.paymentMethod === "BARIDIMOB" && order.paymentStatus !== "PAID" && (
        <div className="mt-6 rounded-[var(--radius)] border border-line bg-paper p-5">
          <h2 className="font-display text-base font-bold">{t("order.baridimobInstructionsTitle")}</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">
            {settings.baridimobInfo || "—"}
          </p>
          <p className="mt-2 text-sm">
            {t("order.reference")}: <span className="num font-bold">{order.reference}</span> ·{" "}
            {t("common.total")}: <span className="num font-bold">{formatDZD(order.total)}</span>
          </p>
          <BaridimobForm
            reference={order.reference}
            labels={{
              refLabel: t("order.baridimobRefLabel"),
              submit: t("order.baridimobSubmit"),
              done: t("product.addedToCart"),
              error: t("errors.generic"),
            }}
          />
        </div>
      )}

      <div className="mt-6 rounded-[var(--radius)] border border-line p-5">
        <h2 className="mb-3 font-display text-base font-bold">{t("order.items")}</h2>
        <ul className="divide-y divide-line">
          {order.items.map((it) => (
            <li key={it.id} className="flex items-center justify-between py-2 text-sm">
              <span>
                {it.nameSnapshot} · <span className="num">{it.size}</span> ×{" "}
                <span className="num">{it.quantity}</span>
              </span>
              <span className="num">{formatDZD(it.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-soft">{t("common.subtotal")}</dt>
            <dd className="num">{formatDZD(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-soft">{t("common.shipping")}</dt>
            <dd className="num">{order.shippingFee === 0 ? t("common.free") : formatDZD(order.shippingFee)}</dd>
          </div>
          <div className="flex justify-between text-base font-bold">
            <dt>{t("common.total")}</dt>
            <dd className="num">{formatDZD(order.total)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">
          {order.customerName} · <span className="num">{order.customerPhone}</span> · {order.wilayaName} — {order.communeName}
        </p>
      </div>

      <div className="mt-6 text-center">
        <Button asChild variant="outline">
          <Link href="/products">{t("common.continueShopping")}</Link>
        </Button>
      </div>
    </div>
  );
}
