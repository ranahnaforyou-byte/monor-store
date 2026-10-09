"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { sendMessage } from "@/app/actions/team";

export function ChatComposer({ channel }: { channel: string }) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setError(null);
    start(async () => {
      const res = await sendMessage(channel, body);
      if (res.ok) setText("");
      else setError(res.error);
    });
  }

  return (
    <form
      onSubmit={submit}
      className="fixed inset-x-0 bottom-[68px] z-20 mx-auto max-w-[480px] border-t border-line bg-paper/95 px-3 py-2.5 backdrop-blur"
    >
      {error && <p className="mb-1 text-xs text-coral">{error}</p>}
      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب رسالة لفريق القسم…"
          maxLength={500}
          className="h-11 flex-1 rounded-full border border-line-strong bg-surface px-4 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={pending || !text.trim()}
          aria-label="إرسال"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 -scale-x-100" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
          </svg>
        </button>
      </div>
    </form>
  );
}

/** Keeps the newest message in view when new ones arrive. */
export function ScrollToEnd({ marker }: { marker: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: first.current ? "auto" : "smooth", block: "end" });
    first.current = false;
  }, [marker]);
  return <div ref={ref} />;
}
