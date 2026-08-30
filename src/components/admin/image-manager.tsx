"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  uploadProductImage,
  removeProductImage,
  moveProductImage,
  makePrimaryImage,
} from "@/app/actions/admin-products";

type Img = { id: string; url: string; isPrimary: boolean };

export function ImageManager({ productId, images }: { productId: string; images: Img[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function upload(file: File) {
    const fd = new FormData();
    fd.set("productId", productId);
    fd.set("file", file);
    startTransition(async () => {
      const res = await uploadProductImage(fd);
      if (!res.ok) setError(res.error);
      else setError(null);
      router.refresh();
    });
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-paper p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">الصور</h2>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          {pending ? "جاري الرفع…" : "رفع صورة"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
      </div>

      {error && <p className="mt-2 text-xs text-sale">تعذّر رفع الصورة ({error}).</p>}

      {images.length === 0 ? (
        <p className="mt-3 text-sm text-muted">لا توجد صور بعد.</p>
      ) : (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img, i) => (
            <li key={img.id} className="overflow-hidden rounded-[var(--radius)] border border-line">
              <div className="relative aspect-square bg-surface">
                <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
                {img.isPrimary && (
                  <span className="absolute start-1 top-1 rounded bg-brand px-1.5 text-[10px] font-bold text-brand-ink">
                    رئيسية
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1 p-1 text-[11px]">
                <button
                  disabled={pending || i === 0}
                  className="rounded px-1.5 py-0.5 hover:bg-surface disabled:opacity-30"
                  onClick={() =>
                    startTransition(async () => {
                      await moveProductImage(img.id, productId, "up");
                      router.refresh();
                    })
                  }
                >
                  ↑
                </button>
                <button
                  disabled={pending || i === images.length - 1}
                  className="rounded px-1.5 py-0.5 hover:bg-surface disabled:opacity-30"
                  onClick={() =>
                    startTransition(async () => {
                      await moveProductImage(img.id, productId, "down");
                      router.refresh();
                    })
                  }
                >
                  ↓
                </button>
                {!img.isPrimary && (
                  <button
                    disabled={pending}
                    className="rounded px-1.5 py-0.5 text-brand hover:bg-surface"
                    onClick={() =>
                      startTransition(async () => {
                        await makePrimaryImage(img.id, productId);
                        router.refresh();
                      })
                    }
                  >
                    رئيسية
                  </button>
                )}
                <button
                  disabled={pending}
                  className="rounded px-1.5 py-0.5 text-sale hover:bg-surface"
                  onClick={() =>
                    startTransition(async () => {
                      await removeProductImage(img.id, productId);
                      router.refresh();
                    })
                  }
                >
                  حذف
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
