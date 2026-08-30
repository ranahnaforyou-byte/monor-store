"use client";

import { useActionState, useMemo, useState } from "react";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import { formatDZD } from "@/lib/money";
import { Input, Textarea, Select, Label } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { placeOrder, type CheckoutState } from "@/app/actions/checkout";
import type { ResolvedCart } from "@/lib/cart/service";

type Wilaya = { code: number; name: string; nameAr: string };
type Commune = { name: string; nameAr: string; hasStopDesk: boolean };
type FeeTable = Record<number, { home: number; stopDesk: number }>;

type Labels = Record<
  | "contact" | "fullName" | "phone" | "email" | "delivery" | "wilaya" | "commune"
  | "address" | "deliveryMode" | "toHome" | "toStopDesk" | "notes" | "payment"
  | "cod" | "baridimob" | "placeOrder" | "orderSummary" | "processing"
  | "selectWilaya" | "selectCommune" | "subtotal" | "shipping" | "total" | "free"
  | "genericError" | "phoneError" | "cartChanged",
  string
>;

export function CheckoutForm({
  cart,
  wilayas,
  communesByWilaya,
  feeTable,
  freeShippingThreshold,
  codEnabled,
  baridimobEnabled,
  locale,
  labels,
}: {
  cart: ResolvedCart;
  wilayas: Wilaya[];
  communesByWilaya: Record<number, Commune[]>;
  feeTable: FeeTable;
  freeShippingThreshold: number | null;
  codEnabled: boolean;
  baridimobEnabled: boolean;
  locale: "ar" | "fr";
  labels: Labels;
}) {
  const [state, formAction] = useActionState<CheckoutState, FormData>(placeOrder, {});
  const [wilayaCode, setWilayaCode] = useState<number | "">("");
  const [mode, setMode] = useState<"HOME" | "STOP_DESK">("HOME");

  const communes = wilayaCode ? communesByWilaya[wilayaCode] ?? [] : [];

  const shipping = useMemo(() => {
    if (!wilayaCode) return null;
    const row = feeTable[wilayaCode];
    if (!row) return null;
    const base = mode === "STOP_DESK" ? row.stopDesk : row.home;
    if (freeShippingThreshold != null && cart.subtotal >= freeShippingThreshold) return 0;
    return base;
  }, [wilayaCode, mode, feeTable, freeShippingThreshold, cart.subtotal]);

  const total = cart.subtotal + (shipping ?? 0);
  const wname = (w: Wilaya) => (locale === "fr" ? w.name : w.nameAr);
  const cname = (c: Commune) => (locale === "fr" ? c.name : c.nameAr);

  const errorText =
    state.error === "phone"
      ? labels.phoneError
      : state.error === "cartChanged"
        ? labels.cartChanged
        : state.error
          ? labels.genericError
          : null;

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="mb-1 font-display text-lg font-bold">{labels.contact}</legend>
          <div>
            <Label htmlFor="customerName">{labels.fullName}</Label>
            <Input id="customerName" name="customerName" required minLength={2} maxLength={120} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="customerPhone">{labels.phone}</Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                inputMode="tel"
                required
                placeholder="0555 12 34 56"
                pattern="0[5-7][0-9]{8}"
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">{labels.email}</Label>
              <Input id="customerEmail" name="customerEmail" type="email" />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-1 font-display text-lg font-bold">{labels.delivery}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="wilayaCode">{labels.wilaya}</Label>
              <Select
                id="wilayaCode"
                name="wilayaCode"
                required
                value={wilayaCode}
                onChange={(e) => setWilayaCode(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">{labels.selectWilaya}</option>
                {wilayas.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.code} — {wname(w)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="communeName">{labels.commune}</Label>
              <Select id="communeName" name="communeName" required disabled={!wilayaCode}>
                <option value="">{labels.selectCommune}</option>
                {communes.map((c) => (
                  <option key={c.name} value={c.name}>
                    {cname(c)}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="addressLine">{labels.address}</Label>
            <Input id="addressLine" name="addressLine" required minLength={5} maxLength={240} />
          </div>
          <div>
            <Label>{labels.deliveryMode}</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["HOME", "STOP_DESK"] as const).map((m) => (
                <label
                  key={m}
                  className={`flex cursor-pointer items-center gap-2 rounded-[var(--radius)] border p-3 text-sm ${
                    mode === m ? "border-brand bg-brand-soft" : "border-line-strong"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMode"
                    value={m}
                    checked={mode === m}
                    onChange={() => setMode(m)}
                    className="accent-[var(--brand)]"
                  />
                  {m === "HOME" ? labels.toHome : labels.toStopDesk}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="notes">{labels.notes}</Label>
            <Textarea id="notes" name="notes" maxLength={500} />
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="mb-1 font-display text-lg font-bold">{labels.payment}</legend>
          {codEnabled && (
            <label className="flex cursor-pointer items-center gap-2 rounded-[var(--radius)] border border-line-strong p-3 text-sm">
              <input type="radio" name="paymentMethod" value="COD" defaultChecked className="accent-[var(--brand)]" />
              {labels.cod}
            </label>
          )}
          {baridimobEnabled && (
            <label className="flex cursor-pointer items-center gap-2 rounded-[var(--radius)] border border-line-strong p-3 text-sm">
              <input
                type="radio"
                name="paymentMethod"
                value="BARIDIMOB"
                defaultChecked={!codEnabled}
                className="accent-[var(--brand)]"
              />
              {labels.baridimob}
            </label>
          )}
        </fieldset>

        {errorText && (
          <p className="rounded-[var(--radius)] bg-sale-soft px-3 py-2 text-sm text-sale">{errorText}</p>
        )}
      </div>

      <aside className="h-fit rounded-[var(--radius-lg)] border border-line bg-surface p-5">
        <h2 className="mb-3 font-display text-base font-bold">{labels.orderSummary}</h2>
        <ul className="mb-4 space-y-3">
          {cart.items
            .filter((i) => !i.unavailable)
            .map((i) => (
              <li key={i.key} className="flex gap-3">
                <div className="relative h-14 w-14 flex-none overflow-hidden rounded-[var(--radius-sm)] bg-paper">
                  {i.image && <Image src={i.image} alt="" fill sizes="56px" className="object-cover" />}
                </div>
                <div className="flex-1 text-xs">
                  <p className="line-clamp-1 font-medium">{i.name}</p>
                  <p className="text-muted">
                    <span className="num">{i.size}</span> × <span className="num">{i.quantity}</span>
                  </p>
                </div>
                <span className="num text-xs font-semibold">{formatDZD(i.lineTotal)}</span>
              </li>
            ))}
        </ul>
        <dl className="space-y-1.5 border-t border-line pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-soft">{labels.subtotal}</dt>
            <dd className="num">{formatDZD(cart.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-soft">{labels.shipping}</dt>
            <dd className="num">
              {shipping == null ? "—" : shipping === 0 ? labels.free : formatDZD(shipping)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-line pt-1.5 text-base font-bold">
            <dt>{labels.total}</dt>
            <dd className="num">{formatDZD(total)}</dd>
          </div>
        </dl>
        <SubmitButton idle={labels.placeOrder} busy={labels.processing} />
      </aside>
    </form>
  );
}

function SubmitButton({ idle, busy }: { idle: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" variant="accent" className="mt-4 w-full" disabled={pending}>
      {pending ? busy : idle}
    </Button>
  );
}
