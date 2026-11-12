"use client";

import { PhotoCarousel } from "@/components/public/photo-carousel";
import type { GalleryItem } from "@/lib/local-media";

/** Galería pública = carrusel horizontal (peek + autoplay). */
export function Gallery({ items }: { items: GalleryItem[] }) {
  return <PhotoCarousel items={items} />;
}
