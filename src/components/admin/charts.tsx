import { formatDZD } from "@/lib/money";

/** Lightweight hand-rolled SVG charts — no charting dependency. */

export function LineChart({
  data,
  height = 160,
}: {
  data: { date: string; value: number }[];
  height?: number;
}) {
  if (data.length === 0) return <p className="text-sm text-muted">لا توجد بيانات.</p>;
  const w = 640;
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const points = data
    .map((d, i) => `${i * step},${height - (d.value / max) * (height - 20) - 10}`)
    .join(" ");
  const area = `0,${height} ${points} ${w},${height}`;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" role="img" aria-label="مبيعات يومية">
      <polygon points={area} fill="var(--brand-soft)" />
      <polyline points={points} fill="none" stroke="var(--brand)" strokeWidth={2.5} />
      <line x1="0" y1={height - 10} x2={w} y2={height - 10} stroke="var(--line)" />
    </svg>
  );
}

export function BarList({
  data,
  money = true,
}: {
  data: { name: string; value: number }[];
  money?: boolean;
}) {
  if (data.length === 0) return <p className="text-sm text-muted">لا توجد بيانات.</p>;
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-2">
      {data.map((d) => (
        <li key={d.name} className="text-sm">
          <div className="flex justify-between">
            <span className="line-clamp-1">{d.name}</span>
            <span className="num text-muted">{money ? formatDZD(d.value) : d.value}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-surface-2">
            <div
              className="h-1.5 rounded-full bg-brand"
              style={{ width: `${Math.max(3, (d.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
