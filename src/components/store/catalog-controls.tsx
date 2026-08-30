"use client";

import { useCallback, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Select, Input } from "@/components/ui/primitives";

type Labels = {
  filters: string;
  sort: string;
  sortNewest: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortNameAsc: string;
  priceRange: string;
  availability: string;
  onlyInStock: string;
  brand: string;
  size: string;
  apply: string;
  clear: string;
  close: string;
};

export function CatalogControls({
  brands,
  sizes,
  labels,
}: {
  brands: string[];
  sizes: string[];
  labels: Labels;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const setParams = useCallback(
    (mut: (p: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mut(next);
      next.delete("page");
      startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
    },
    [params, pathname, router],
  );

  const selectedBrands = params.getAll("brand");
  const selectedSizes = params.getAll("size");

  const toggleMulti = (key: string, value: string) =>
    setParams((p) => {
      const current = p.getAll(key);
      p.delete(key);
      const nextValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      nextValues.forEach((v) => p.append(key, v));
    });

  return (
    <div className="flex items-center gap-2">
      <Select
        aria-label={labels.sort}
        className="h-10 w-auto min-w-40"
        value={params.get("sort") ?? "newest"}
        onChange={(e) => setParams((p) => p.set("sort", e.target.value))}
        disabled={isPending}
      >
        <option value="newest">{labels.sortNewest}</option>
        <option value="price-asc">{labels.sortPriceAsc}</option>
        <option value="price-desc">{labels.sortPriceDesc}</option>
        <option value="name-asc">{labels.sortNameAsc}</option>
      </Select>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <Button variant="outline" size="sm" className="h-10">
            {labels.filters}
            {(selectedBrands.length || selectedSizes.length || params.get("inStock")) && (
              <span className="num ms-1 rounded bg-brand px-1.5 text-[11px] text-brand-ink">
                {selectedBrands.length + selectedSizes.length + (params.get("inStock") ? 1 : 0)}
              </span>
            )}
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed inset-y-0 end-0 z-50 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-paper p-5 shadow-[var(--shadow-lg)] focus:outline-none">
            <div className="flex items-center justify-between">
              <Dialog.Title className="font-display text-lg font-bold">{labels.filters}</Dialog.Title>
              <Dialog.Close aria-label={labels.close} className="rounded p-1 hover:bg-surface">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </Dialog.Close>
            </div>

            {brands.length > 0 && (
              <fieldset className="mt-5">
                <legend className="mb-2 text-sm font-semibold">{labels.brand}</legend>
                <div className="flex flex-col gap-1.5">
                  {brands.map((b) => (
                    <label key={b} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="size-4 accent-[var(--brand)]"
                        checked={selectedBrands.includes(b)}
                        onChange={() => toggleMulti("brand", b)}
                      />
                      {b}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {sizes.length > 0 && (
              <fieldset className="mt-5">
                <legend className="mb-2 text-sm font-semibold">{labels.size}</legend>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleMulti("size", s)}
                      className={`num h-9 min-w-11 rounded-[var(--radius-sm)] border px-2 text-sm ${
                        selectedSizes.includes(s)
                          ? "border-brand bg-brand-soft text-brand"
                          : "border-line-strong"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <fieldset className="mt-5">
              <legend className="mb-2 text-sm font-semibold">{labels.priceRange}</legend>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  defaultValue={params.get("min") ?? ""}
                  onBlur={(e) =>
                    setParams((p) => (e.target.value ? p.set("min", e.target.value) : p.delete("min")))
                  }
                />
                <span className="text-muted">—</span>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="∞"
                  defaultValue={params.get("max") ?? ""}
                  onBlur={(e) =>
                    setParams((p) => (e.target.value ? p.set("max", e.target.value) : p.delete("max")))
                  }
                />
              </div>
            </fieldset>

            <label className="mt-5 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-[var(--brand)]"
                checked={Boolean(params.get("inStock"))}
                onChange={(e) =>
                  setParams((p) => (e.target.checked ? p.set("inStock", "1") : p.delete("inStock")))
                }
              />
              {labels.onlyInStock}
            </label>

            <div className="mt-auto flex gap-2 pt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  startTransition(() => router.push(pathname, { scroll: false }));
                  setOpen(false);
                }}
              >
                {labels.clear}
              </Button>
              <Button className="flex-1" onClick={() => setOpen(false)}>
                {labels.apply}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
