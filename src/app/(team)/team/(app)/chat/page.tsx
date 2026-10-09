import Link from "next/link";
import { requireTeamUser } from "@/lib/hanout/team-session";
import { CHANNELS, getChannelMessages, type ChannelSlug } from "@/server/services/hanout";
import { clock, DEPT_TONE } from "@/lib/hanout/format";
import { Avatar } from "@/components/hanout/avatar";
import { ChatComposer, ScrollToEnd } from "@/components/hanout/chat-composer";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TONE: Record<string, string> = {
  new: "border-coral/30 bg-coral-soft text-[#b3362c]",
  confirmed: "border-mint/30 bg-mint-soft text-[#0f7a52]",
  warning: "border-saffron/40 bg-saffron-soft text-[#8a6100]",
  done: "border-brand/20 bg-brand-soft text-brand",
};

function SysIcon({ tone }: { tone: string | null }) {
  const d =
    tone === "new"
      ? "M12 5v14M5 12h14"
      : tone === "warning"
        ? "M12 8v5M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"
        : "M20 6 9 17l-5-5";
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export default async function TeamChatPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const user = await requireTeamUser();
  const { c } = await searchParams;
  const fallback = (user.department?.slug ?? "team") as ChannelSlug;
  const channel: ChannelSlug = CHANNELS.some((x) => x.slug === c) ? (c as ChannelSlug) : fallback;
  const messages = await getChannelMessages(channel, 50);
  const last = messages.at(-1);

  return (
    <div className="pb-16">
      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
        {CHANNELS.map((x) => {
          const tone = x.slug === "team" ? DEPT_TONE.owner : DEPT_TONE[x.slug];
          return (
            <Link
              key={x.slug}
              href={`/team/chat?c=${x.slug}`}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-bold",
                channel === x.slug ? `${tone.bg} ${tone.fg} border-transparent` : "border-line bg-paper text-muted",
              )}
            >
              {x.slug === "team" ? "الفريق كله" : `قسم ${x.name}`}
            </Link>
          );
        })}
      </div>

      <ol className="space-y-3">
        {messages.map((m) => {
          if (m.kind === "SYSTEM") {
            return (
              <li key={m.id} className="anim-pop">
                <div className={cn("flex items-start gap-2.5 rounded-2xl border px-3.5 py-2.5", TONE[m.tone ?? "done"])}>
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/70">
                    <SysIcon tone={m.tone} />
                  </span>
                  <p className="flex-1 text-[13px] font-semibold leading-relaxed">{m.body}</p>
                  <time className="num shrink-0 text-[11px] opacity-70">{clock(m.createdAt)}</time>
                </div>
              </li>
            );
          }
          const mine = m.authorId === user.id;
          return (
            <li key={m.id} className={cn("anim-pop flex items-end gap-2", mine && "flex-row-reverse")}>
              {!mine && m.author && <Avatar user={m.author} size="sm" />}
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-3.5 py-2",
                  mine ? "rounded-ee-md bg-brand text-white" : "rounded-es-md border border-line bg-paper",
                )}
              >
                {!mine && <p className="text-[11px] font-bold text-brand">{m.author?.name ?? "عضو"}</p>}
                <p className="text-sm leading-relaxed">{m.body}</p>
                <time className={cn("num mt-0.5 block text-[10px]", mine ? "text-white/70" : "text-muted")}>{clock(m.createdAt)}</time>
              </div>
            </li>
          );
        })}
      </ol>
      <ScrollToEnd marker={last?.id ?? "empty"} />
      <ChatComposer channel={channel} />
    </div>
  );
}
