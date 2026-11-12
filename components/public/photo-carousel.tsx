"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import CircularCarousel from "@/components/public/CircularCarousel";
import type { GalleryItem } from "@/lib/local-media";

type Photo = Extract<GalleryItem, { kind: "photo" }>;

function useCarouselLayout() {
  const [layout, setLayout] = useState({
    stageH: 300,
    cardH: 200,
    gap: 16,
    perspective: 1600,
    depthFade: 0.22,
  });

  useEffect(() => {
    const apply = () => {
      const w = window.innerWidth;
      if (w < 400) {
        setLayout({ stageH: 280, cardH: 180, gap: 14, perspective: 1400, depthFade: 0.18 });
      } else if (w < 640) {
        setLayout({ stageH: 320, cardH: 210, gap: 16, perspective: 1600, depthFade: 0.22 });
      } else if (w < 1024) {
        setLayout({ stageH: 400, cardH: 270, gap: 18, perspective: 2000, depthFade: 0.28 });
      } else {
        setLayout({ stageH: 480, cardH: 320, gap: 20, perspective: 2400, depthFade: 0.3 });
      }
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  return layout;
}

/** Galería “El lugar”: slots iguales + gap constante. */
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
        aspectRatio={0.72}
        speed={12}
        captions={false}
        gap={layout.gap}
        tilt={-2}
        curve={1.08}
        perspective={layout.perspective}
        autoplay="drift"
        interval={3}
        direction="left"
        momentum={0.65}
        snap
        pauseOnHover
        focusOnClick
        draggable
        parallax={0}
        stretch={0.75}
        fadeColor="#ffffff"
        depthFade={layout.depthFade}
        innerShade={0.2}
        cornerRadius={10}
      />
    </div>
  );
}
