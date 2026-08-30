"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export function SearchBox({ initial, placeholder }: { initial: string; placeholder: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
      }}
    >
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <Button type="submit">{placeholder}</Button>
    </form>
  );
}
