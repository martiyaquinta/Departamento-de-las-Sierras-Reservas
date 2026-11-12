"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Photo } from "@/lib/types";
import { photoPublicUrl } from "@/lib/data-client";

export function Gallery({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState(0);
  const list = photos.length ? photos : [];

  const go = useCallback(
    (dir: -1 | 1) => {
      if (list.length < 2) return;
      setActive((i) => (i + dir + list.length) % list.length);
    },
    [list.length]
  );

  useEffect(() => {
    if (list.length < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, list.length]);

  if (!list.length) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-arena">
        <Image
          src="/brand/logo-beige.png"
          alt="Departamento de las Sierras"
          fill
          className="object-contain p-8"
          sizes="(max-width: 768px) 100vw, 960px"
          priority
        />
      </div>
    );
  }

  const main = list[Math.min(active, list.length - 1)];

  return (
    <div className="space-y-3">
      <div className="group relative aspect-[4/3] overflow-hidden rounded-sm bg-arena sm:aspect-[16/10]">
        <Image
          src={photoPublicUrl(main.storage_path)}
          alt={main.alt ?? "Foto del departamento"}
          fill
          className="object-cover photo-hover"
          sizes="(max-width: 768px) 100vw, 960px"
          priority
        />

        {list.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-crema/95 text-marron shadow-md transition hover:bg-crema sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Foto siguiente"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-crema/95 text-marron shadow-md transition hover:bg-crema sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <p className="absolute bottom-3 right-3 z-10 rounded-full bg-marron/80 px-3 py-1 text-xs font-medium text-crema">
              {active + 1} / {list.length}
            </p>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {list.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative h-20 w-24 shrink-0 overflow-hidden rounded-sm ring-offset-2 ring-offset-background transition sm:h-24 sm:w-28",
                i === active ? "ring-2 ring-marron" : "opacity-75 hover:opacity-100"
              )}
            >
              <Image
                src={photoPublicUrl(p.storage_path)}
                alt={p.alt ?? ""}
                fill
                className="object-cover"
                sizes="112px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
