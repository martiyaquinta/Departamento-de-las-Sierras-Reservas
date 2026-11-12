"use client";

import Image from "next/image";
import CircularCarousel from "@/components/public/CircularCarousel";
import type { GalleryItem } from "@/lib/local-media";

type Photo = Extract<GalleryItem, { kind: "photo" }>;

/** Galería “El lugar”: todas las fotos de fotosdepto, enteras (contain). */
export function PhotoCarousel({ items }: { items: GalleryItem[] }) {
  const photos = items.filter((i): i is Photo => i.kind === "photo");

  if (!photos.length) {
    return (
      <div className="relative mx-auto h-[min(70vh,560px)] w-full max-w-md overflow-hidden bg-transparent">
        <Image
          src="/photos/tandil.png"
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
  }));

  // Portrait-first 720×1280 (ar≈0.56): contain muestra la foto entera
  return (
    <div className="relative w-full" style={{ height: 620 }}>
      <CircularCarousel
        items={carouselItems}
        preset="cylinder"
        intro="rise"
        cardWidth={200}
        aspectRatio={0.562}
        speed={12}
        captions={false}
        gap={14}
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
        depthFade={0.4}
        innerShade={0.28}
        cornerRadius={10}
      />
    </div>
  );
}
