"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/app/actions/cart";

type SizeStock = { size: string; quantity: number };

type Labels = {
  selectSize: string;
  size: string;
  quantity: string;
  addToCart: string;
  buyNow: string;
  outOfStock: string;
  added: string;
  lowStock: string;
  genericError: string;
};

export function ProductPurchase({
  productId,
  sizeStock,
  colors,
  labels,
}: {
  productId: string;
  sizeStock: SizeStock[];
  colors: string[];
  labels: Labels;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(colors[0] ?? null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const anyStock = sizeStock.some((s) => s.quantity > 0);
  const selected = sizeStock.find((s) => s.size === size);
  const maxQty = Math.min(10, selected?.quantity ?? 0);

  function submit(then: "stay" | "checkout") {
    if (!size) {
      setMsg({ kind: "err", text: labels.selectSize });
      return;
    }
    startTransition(async () => {
      const res = await addToCart({ productId, size, color: color ?? undefined, quantity: qty });
      if (!res.ok) {
        setMsg({ kind: "err", text: res.error === "outOfStock" ? labels.outOfStock : labels.genericError });
        return;
      }
      setMsg({ kind: "ok", text: labels.added });
      router.refresh();
      if (then === "checkout") router.push("/checkout");
    });
  }

  if (!anyStock) {
    return (
      <p className="rounded-[var(--radius)] bg-surface-2 px-4 py-3 text-sm font-medium text-muted">
        {labels.outOfStock}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-medium text-ink-soft">{labels.selectSize}</p>
        <div className="flex flex-wrap gap-2">
          {sizeStock.map((s) => {
            const disabled = s.quantity <= 0;
            return (
              <button
                key={s.size}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setSize(s.size);
                  setQty(1);
                  setMsg(null);
                }}
                className={`num h-11 min-w-12 rounded-[var(--radius)] border px-2 text-sm transition-colors ${
                  size === s.size
                    ? "border-brand bg-brand text-brand-ink"
                    : disabled
                      ? "cursor-not-allowed border-line bg-surface text-muted line-through"
                      : "border-line-strong hover:border-brand"
                }`}
              >
                {s.size}
              </button>
            );
          })}
        </div>
        {selected && selected.quantity <= 3 && (
          <p className="mt-1.5 text-xs text-warning">
            {labels.lowStock} ({selected.quantity})
          </p>
        )}
      </div>

      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-ink-soft">{colors.length > 1 ? "" : ""}</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  color === c ? "border-brand bg-brand-soft text-brand" : "border-line-strong"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-ink-soft">{labels.quantity}</span>
        <div className="flex items-center rounded-[var(--radius)] border border-line-strong">
          <button
            type="button"
            className="h-10 w-10 text-lg disabled:opacity-40"
            disabled={qty <= 1}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="num w-10 text-center text-sm">{qty}</span>
          <button
            type="button"
            className="h-10 w-10 text-lg disabled:opacity-40"
            disabled={!size || qty >= maxQty}
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
          >
            +
          </button>
        </div>
      </div>

      {msg && (
        <p
          className={`rounded-[var(--radius)] px-3 py-2 text-sm ${
            msg.kind === "ok" ? "bg-brand-soft text-brand" : "bg-sale-soft text-sale"
          }`}
        >
          {msg.text}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="flex-1" size="lg" disabled={pending} onClick={() => submit("stay")}>
          {labels.addToCart}
        </Button>
        <Button
          className="flex-1"
          size="lg"
          variant="accent"
          disabled={pending}
          onClick={() => submit("checkout")}
        >
          {labels.buyNow}
        </Button>
      </div>
    </div>
  );
}
