import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-xl font-bold">{title}</h1>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  tone?: "default" | "brand" | "warning" | "danger";
}) {
  const toneClass = {
    default: "",
    brand: "text-brand",
    warning: "text-warning",
    danger: "text-danger",
  }[tone];
  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-paper p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={cn("num mt-1 text-2xl font-bold", toneClass)}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export function Panel({
  title,
  children,
  className,
  action,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-[var(--radius-lg)] border border-line bg-paper", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          {title && <h2 className="text-sm font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-paper">
      <table className="w-full min-w-[640px] text-sm">{children}</table>
    </div>
  );
}

export function Th({
  children,
  className,
  colSpan,
}: {
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <th
      colSpan={colSpan}
      className={cn(
        "border-b border-line bg-surface px-3 py-2 text-start text-xs font-semibold uppercase tracking-wide text-muted",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  colSpan,
}: {
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className={cn("border-b border-line px-3 py-2 align-middle", className)}>
      {children}
    </td>
  );
}

export function Field({
  label,
  children,
  hint,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  htmlFor?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-ink-soft">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[var(--radius-lg)] border border-dashed border-line bg-paper p-8 text-center text-sm text-muted">
      {children}
    </p>
  );
}

const pill = {
  PENDING: "bg-surface-2 text-ink-soft",
  CONFIRMED: "bg-brand-soft text-brand",
  PREPARING: "bg-[color-mix(in_srgb,var(--info)_12%,white)] text-info",
  SHIPPED: "bg-[color-mix(in_srgb,var(--info)_12%,white)] text-info",
  DELIVERED: "bg-brand-soft text-success",
  RETURNED: "bg-sale-soft text-sale",
  CANCELLED: "bg-sale-soft text-danger",
  UNPAID: "bg-surface-2 text-ink-soft",
  PAID: "bg-brand-soft text-success",
  REFUNDED: "bg-sale-soft text-sale",
  FAILED: "bg-sale-soft text-danger",
  ACTIVE: "bg-brand-soft text-success",
  DRAFT: "bg-surface-2 text-ink-soft",
  ARCHIVED: "bg-sale-soft text-muted",
} as Record<string, string>;

export function StatusPill({ value }: { value: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold", pill[value] ?? "bg-surface-2 text-ink-soft")}>
      {value}
    </span>
  );
}

export function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center rounded-[var(--radius)] bg-brand px-4 text-sm font-medium text-brand-ink hover:bg-brand-hover"
    >
      {children}
    </Link>
  );
}
