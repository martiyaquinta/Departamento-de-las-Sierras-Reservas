"use client";

import Image from "next/image";
import CircularCarousel from "@/components/public/CircularCarousel";
import type { GalleryItem } from "@/lib/local-media";

type Photo = Extract<GalleryItem, { kind: "photo" }>;

/** Galería “El lugar”: fotosdepto enteras, proporción nativa, sin fondo blanco. */
export function PhotoCarousel({ items }: { items: GalleryItem[] }) {
  const photos = items.filter((i): i is Photo => i.kind === "photo");

  if (!photos.length) {
    return (
      <div className="relative mx-auto h-[min(70vh,560px)] w-full max-w-md overflow-hidden bg-transparent">
        <Image
          src="/photos/depto-03.jpg"
          alt="Departamento de las Sierras"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 420px"
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
    <div className="relative w-full" style={{ height: 640 }}>
      <CircularCarousel
        items={carouselItems}
        preset="cylinder"
        intro="rise"
        cardHeight={380}
        speed={12}
        captions={false}
        gap={16}
        tilt={-2}
        curve={1}
        perspective={2600}
        autoplay="drift"
        interval={3}
        direction="left"
        momentum={0.65}
        snap
        pauseOnHover
        focusOnClick
        draggable
        parallax={0.25}
        stretch={0.7}
        fadeColor="#ffffff"
        depthFade={0.35}
        innerShade={0.22}
        cornerRadius={10}
      />
    </div>
  );
}
