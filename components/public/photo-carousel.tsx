"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/lib/local-media";

const AUTOPLAY_MS = 4000;

type Photo = Extract<GalleryItem, { kind: "photo" }>;

/** Carrusel horizontal snap + peek + autoplay. Sin fondo rosa/arena. */
export function PhotoCarousel({ items }: { items: GalleryItem[] }) {
  const photos = items.filter((i): i is Photo => i.kind === "photo");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const el = scrollerRef.current;
    if (!el || photos.length === 0) return;
    const i = ((index % photos.length) + photos.length) % photos.length;
    const slide = el.querySelector<HTMLElement>(`[data-slide="${i}"]`);
    if (!slide) return;
    const left = slide.offsetLeft - (el.clientWidth - slide.clientWidth) / 2;
    el.scrollTo({ left, behavior });
  }, [photos.length]);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (photos.length < 2) return;
      scrollToIndex(active + dir);
    },
    [active, photos.length, scrollToIndex]
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const center = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      el.querySelectorAll<HTMLElement>("[data-slide]").forEach((slide) => {
        const mid = slide.offsetLeft + slide.clientWidth / 2;
        const d = Math.abs(mid - center);
        if (d < bestDist) {
          bestDist = d;
          best = Number(slide.dataset.slide ?? 0);
        }
      });
      setActive(best);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [photos.length]);

  useEffect(() => {
    if (photos.length < 2 || paused || reduceMotion) return;
    const id = window.setInterval(() => {
      scrollToIndex(active + 1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [active, paused, photos.length, reduceMotion, scrollToIndex]);

  useEffect(() => {
    if (photos.length < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, photos.length]);

  if (!photos.length) {
    return (
      <div className="relative mx-auto h-[min(70vh,640px)] w-full max-w-md overflow-hidden bg-transparent">
        <Image
          src="/photos/depto-hero.jpg"
          alt="Departamento de las Sierras"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 420px"
          priority
        />
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth bg-transparent px-[11vw] pb-2 sm:gap-4 sm:px-[18vw] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
        role="region"
        aria-roledescription="carrusel"
        aria-label="Fotos del lugar"
      >
        {photos.map((item, i) => (
          <div
            key={item.id}
            data-slide={i}
            className="relative h-[min(70vh,640px)] w-[78vw] min-w-[78vw] shrink-0 snap-center bg-transparent sm:w-[42vw] sm:min-w-[42vw]"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 78vw, 42vw"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => go(-1)}
            className="absolute left-1 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-ink shadow-sm transition hover:bg-white sm:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => go(1)}
            className="absolute right-1 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 text-ink shadow-sm transition hover:bg-white sm:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-4 flex items-center justify-center gap-2">
            {photos.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Foto ${i + 1}`}
                aria-current={i === active}
                onClick={() => scrollToIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === active ? "w-6 bg-ink" : "w-1.5 bg-ink/25 hover:bg-ink/50"
                )}
              />
            ))}
            <span className="ml-2 text-xs tabular-nums text-muted-foreground">
              {active + 1}/{photos.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
