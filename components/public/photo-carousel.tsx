"use client";

import Image from "next/image";
import CircularCarousel from "@/components/public/CircularCarousel";
import type { GalleryItem } from "@/lib/local-media";

type Photo = Extract<GalleryItem, { kind: "photo" }>;

/** Galería “El lugar”: cilindro 3D arrastrable. */
export function PhotoCarousel({ items }: { items: GalleryItem[] }) {
  const photos = items.filter((i): i is Photo => i.kind === "photo");

  if (!photos.length) {
    return (
      <div className="relative mx-auto h-[min(70vh,560px)] w-full max-w-md overflow-hidden bg-transparent">
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

  const carouselItems = photos.map((p) => ({
    src: p.src,
    alt: p.alt,
  }));

  return (
    <div className="relative w-full" style={{ height: 560 }}>
      <CircularCarousel
        items={carouselItems}
        preset="cylinder"
        intro="rise"
        cardWidth={240}
        aspectRatio={0.72}
        speed={12}
        captions={false}
        gap={16}
        tilt={-5}
        curve={1}
        perspective={2500}
        autoplay="drift"
        interval={3}
        direction="left"
        momentum={0.65}
        snap
        pauseOnHover
        focusOnClick
        draggable
        parallax={0.3}
        stretch={0.7}
        fadeColor="#ffffff"
        depthFade={0.45}
        innerShade={0.4}
        cornerRadius={12}
      />
    </div>
  );
}
