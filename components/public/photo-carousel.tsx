"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import CircularCarousel from "@/components/public/CircularCarousel";
import type { GalleryItem } from "@/lib/local-media";

type Photo = Extract<GalleryItem, { kind: "photo" }>;

function useCarouselLayout() {
  const [layout, setLayout] = useState({
    stageH: 420,
    cardH: 280,
    gap: 12,
    perspective: 1800,
    depthFade: 0.28,
  });

  useEffect(() => {
    const apply = () => {
      const w = window.innerWidth;
      if (w < 400) {
        setLayout({ stageH: 400, cardH: 260, gap: 10, perspective: 1600, depthFade: 0.22 });
      } else if (w < 640) {
        setLayout({ stageH: 460, cardH: 300, gap: 12, perspective: 1800, depthFade: 0.28 });
      } else if (w < 1024) {
        setLayout({ stageH: 560, cardH: 360, gap: 14, perspective: 2200, depthFade: 0.32 });
      } else {
        setLayout({ stageH: 640, cardH: 400, gap: 16, perspective: 2600, depthFade: 0.35 });
      }
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  return layout;
}

/** Galería “El lugar”: mobile-first, proporción nativa. */
export function PhotoCarousel({ items }: { items: GalleryItem[] }) {
  const photos = items.filter((i): i is Photo => i.kind === "photo");
  const layout = useCarouselLayout();

  if (!photos.length) {
    return (
      <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden bg-transparent">
        <Image
          src="/photos/depto-03.jpg"
          alt="Departamento de las Sierras"
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>
    );
  }

  const carouselItems = photos.map((p) => ({
    src: p.src,
    alt: p.alt,
    aspectRatio: p.aspect,
  }));

  return (
    <div
      className="relative -mx-4 w-[calc(100%+2rem)] sm:mx-0 sm:w-full"
      style={{ height: layout.stageH }}
    >
      <CircularCarousel
        items={carouselItems}
        preset="cylinder"
        intro="rise"
        cardHeight={layout.cardH}
        speed={12}
        captions={false}
        gap={layout.gap}
        tilt={-2}
        curve={1}
        perspective={layout.perspective}
        autoplay="drift"
        interval={3}
        direction="left"
        momentum={0.65}
        snap
        pauseOnHover
        focusOnClick
        draggable
        parallax={0.2}
        stretch={0.75}
        fadeColor="#ffffff"
        depthFade={layout.depthFade}
        innerShade={0.18}
        cornerRadius={10}
      />
    </div>
  );
}
