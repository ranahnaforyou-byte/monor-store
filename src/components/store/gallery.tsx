"use client";

import { useState, useRef } from "react";
import Image from "next/image";

type GalleryImage = {
  url: string;
  alt: string;
  blurDataURL: string;
  width: number;
  height: number;
};

export function Gallery({
  images,
  name,
  labels,
}: {
  images: GalleryImage[];
  name: string;
  labels: { prev: string; next: string };
}) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const touchStartX = useRef<number | null>(null);

  if (images.length === 0) {
    return <div className="aspect-square rounded-[var(--radius-lg)] bg-surface" />;
  }

  const current = images[Math.min(index, images.length - 1)];
  const go = (next: number) => setIndex((next + images.length) % images.length);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="group relative aspect-square overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1)); // RTL-agnostic swipe
          touchStartX.current = null;
        }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(index - 1);
          if (e.key === "ArrowRight") go(index + 1);
        }}
      >
        <Image
          key={current.url}
          src={current.url}
          alt={current.alt || name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 600px"
          placeholder={current.blurDataURL ? "blur" : "empty"}
          blurDataURL={current.blurDataURL || undefined}
          className="object-cover transition-transform duration-200 md:group-hover:scale-[1.8]"
          style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label={labels.prev}
              onClick={() => go(index - 1)}
              className="absolute start-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink shadow-[var(--shadow-sm)] hover:bg-paper md:flex"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label={labels.next}
              onClick={() => go(index + 1)}
              className="absolute end-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink shadow-[var(--shadow-sm)] hover:bg-paper md:flex"
            >
              ›
            </button>
            <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5 md:hidden">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-4 bg-ink" : "w-1.5 bg-ink/30"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${name} ${i + 1}`}
              className={`relative aspect-square w-16 flex-none overflow-hidden rounded-[var(--radius)] border-2 ${
                i === index ? "border-brand" : "border-line"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
