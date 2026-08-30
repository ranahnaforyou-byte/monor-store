"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { submitBaridimobReference } from "@/app/actions/payment";

export function BaridimobForm({
  reference,
  labels,
}: {
  reference: string;
  labels: { refLabel: string; submit: string; done: string; error: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  return (
    <form
      className="mt-3 flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await submitBaridimobReference({ reference, providerRef: value.trim() });
          if (res.ok) {
            setMsg({ kind: "ok", text: labels.done });
            setValue("");
            router.refresh();
          } else {
            setMsg({ kind: "err", text: labels.error });
          }
        });
      }}
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={labels.refLabel}
        required
        minLength={3}
        className="sm:flex-1"
      />
      <Button type="submit" disabled={pending || value.trim().length < 3}>
        {labels.submit}
      </Button>
      {msg && (
        <p className={`text-sm ${msg.kind === "ok" ? "text-brand" : "text-sale"}`}>{msg.text}</p>
      )}
    </form>
  );
}
