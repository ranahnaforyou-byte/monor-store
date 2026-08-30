"use client";

import { useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";

type Item = { label: string; href: string };

export function MobileNav({
  primary,
  categories,
  labels,
}: {
  primary: Item[];
  categories: Item[];
  labels: { menu: string; close: string; categories: string };
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label={labels.menu}
        className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius)] text-ink hover:bg-surface md:hidden"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-y-0 end-0 z-50 flex w-[84%] max-w-sm flex-col bg-paper p-5 shadow-[var(--shadow-lg)] focus:outline-none"
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-display text-lg font-bold">MONOR STORE</Dialog.Title>
            <Dialog.Close
              aria-label={labels.close}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius)] hover:bg-surface"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Dialog.Close>
          </div>

          <nav className="mt-6 flex flex-col gap-1 text-[15px]">
            {primary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-[var(--radius)] px-3 py-2.5 font-medium hover:bg-surface"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {categories.length > 0 && (
            <>
              <p className="mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
                {labels.categories}
              </p>
              <nav className="mt-2 flex flex-col gap-1 text-[15px]">
                {categories.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-[var(--radius)] px-3 py-2 text-ink-soft hover:bg-surface"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
