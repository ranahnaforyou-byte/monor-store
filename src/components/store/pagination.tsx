import Link from "next/link";

export function Pagination({
  page,
  pageCount,
  makeHref,
}: {
  page: number;
  pageCount: number;
  makeHref: (page: number) => string;
}) {
  if (pageCount <= 1) return null;
  const pages = pageRange(page, pageCount);

  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="pagination">
      {page > 1 && (
        <Link
          href={makeHref(page - 1)}
          className="num inline-flex h-10 items-center rounded-[var(--radius)] border border-line-strong px-3 text-sm hover:bg-surface"
          rel="prev"
        >
          ‹
        </Link>
      )}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-2 text-muted">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={makeHref(p)}
            aria-current={p === page ? "page" : undefined}
            className={`num inline-flex h-10 min-w-10 items-center justify-center rounded-[var(--radius)] border px-2 text-sm ${
              p === page
                ? "border-brand bg-brand text-brand-ink"
                : "border-line-strong hover:bg-surface"
            }`}
          >
            {p}
          </Link>
        ),
      )}
      {page < pageCount && (
        <Link
          href={makeHref(page + 1)}
          className="num inline-flex h-10 items-center rounded-[var(--radius)] border border-line-strong px-3 text-sm hover:bg-surface"
          rel="next"
        >
          ›
        </Link>
      )}
    </nav>
  );
}

function pageRange(current: number, total: number): (number | "…")[] {
  const delta = 1;
  const range: (number | "…")[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);
  range.push(1);
  if (left > 2) range.push("…");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push("…");
  if (total > 1) range.push(total);
  return range;
}
