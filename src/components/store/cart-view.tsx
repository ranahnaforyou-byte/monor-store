"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDZD } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { updateCartLine, removeCartLine } from "@/app/actions/cart";
import type { ResolvedCart } from "@/lib/cart/service";

type Labels = {
  size: string;
  remove: string;
  subtotal: string;
  checkout: string;
  empty: string;
  emptyCta: string;
  outOfStock: string;
  adjusted: string;
  estimatedShipping: string;
};

export function CartView({ cart, labels }: { cart: ResolvedCart; labels: Labels }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-muted">{labels.empty}</p>
        <Button asChild>
          <Link href="/products">{labels.emptyCta}</Link>
        </Button>
      </div>
    );
  }

  const setQty = (key: string, quantity: number) =>
    startTransition(async () => {
      await updateCartLine({ key, quantity });
      router.refresh();
    });

  const remove = (key: string) =>
    startTransition(async () => {
      await removeCartLine(key);
      router.refresh();
    });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <ul className="divide-y divide-line">
        {cart.items.map((item) => (
          <li key={item.key} className="flex gap-4 py-4">
            <div className="relative h-24 w-24 flex-none overflow-hidden rounded-[var(--radius)] bg-surface">
              {item.image && (
                <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
              )}
            </div>
            <div className="flex flex-1 flex-col">
              <Link href={`/products/${item.slug}`} className="text-sm font-medium hover:underline">
                {item.name}
              </Link>
              <p className="text-xs text-muted">
                {labels.size}: <span className="num">{item.size}</span>
                {item.color ? ` · ${item.color}` : ""}
              </p>
              {item.unavailable ? (
                <p className="mt-1 text-xs font-medium text-sale">{labels.outOfStock}</p>
              ) : item.adjusted ? (
                <p className="mt-1 text-xs text-warning">{labels.adjusted}</p>
              ) : null}

              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex items-center rounded-[var(--radius)] border border-line-strong">
                  <button
                    className="h-8 w-8 disabled:opacity-40"
                    disabled={pending || item.unavailable}
                    onClick={() => setQty(item.key, Math.max(0, item.quantity - 1))}
                  >
                    −
                  </button>
                  <span className="num w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    className="h-8 w-8 disabled:opacity-40"
                    disabled={pending || item.unavailable || item.quantity >= item.availableForSize}
                    onClick={() => setQty(item.key, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <span className="num text-sm font-semibold">{formatDZD(item.lineTotal)}</span>
              </div>
              <button
                className="mt-1 self-start text-xs text-muted hover:text-sale"
                disabled={pending}
                onClick={() => remove(item.key)}
              >
                {labels.remove}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-[var(--radius-lg)] border border-line bg-surface p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-soft">{labels.subtotal}</span>
          <span className="num font-semibold">{formatDZD(cart.subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-muted">{labels.estimatedShipping}</p>
        <Button asChild className="mt-4 w-full" size="lg" variant="accent">
          <Link href="/checkout">{labels.checkout}</Link>
        </Button>
      </aside>
    </div>
  );
}
