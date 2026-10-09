import { cn } from "@/lib/utils";
import { initials, toneFor } from "@/lib/hanout/format";

export function Avatar({
  user,
  size = "md",
  className,
}: {
  user: { name: string; role: string; department?: { slug: string } | null };
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tone = toneFor(user);
  const s = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg" }[size];
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold ring-2 ring-white",
        tone.bg,
        tone.fg,
        s,
        className,
      )}
    >
      {initials(user.name)}
    </span>
  );
}
