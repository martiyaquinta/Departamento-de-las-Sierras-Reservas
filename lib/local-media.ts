import type { Photo } from "@/lib/types";
import photosManifest from "@/public/photos/manifest.json";

/** Hero full-bleed (fotosdepto/header.jpg). Logo del site = /brand/logo-sinfondo.png */
export const LOCAL_HERO_PATH = "/photos/header.jpg";

export type LocalPhotoMeta = {
  id: string;
  storage_path: string;
  alt: string;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
  width: number;
  height: number;
  aspect: number;
  transparent: boolean;
};

/** Todas las imágenes de fotosdepto (salvo header.jpg → brand). */
export const LOCAL_PHOTOS: LocalPhotoMeta[] = photosManifest.map((m, i) => ({
  id: `local-${String(i + 1).padStart(2, "0")}`,
  storage_path: `/photos/${m.file}`,
  alt: m.file.includes("18") || m.source.toLowerCase().includes("tandil")
    ? "Vista de Tandil"
    : "Departamento de las Sierras",
  sort_order: i,
  is_cover: i === 2,
  created_at: "2026-11-12T00:00:00.000Z",
  width: m.width,
  height: m.height,
  aspect: m.aspect,
  transparent: m.transparent,
}));

export type LocalVideo = {
  id: string;
  src: string;
  poster: string;
  alt: string;
  sort_order: number;
};

export const LOCAL_VIDEOS: LocalVideo[] = [
  {
    id: "vid-01",
    src: "/videos/depto-01.mp4",
    poster: "/videos/depto-01-poster.jpg",
    alt: "Video del departamento",
    sort_order: 0,
  },
  {
    id: "vid-02",
    src: "/videos/depto-02.mp4",
    poster: "/videos/depto-02-poster.jpg",
    alt: "Video del departamento",
    sort_order: 1,
  },
  {
    id: "vid-03",
    src: "/videos/depto-03.mp4",
    poster: "/videos/depto-03-poster.jpg",
    alt: "Video del departamento",
    sort_order: 2,
  },
];

export type GalleryItem =
  | {
      kind: "photo";
      id: string;
      src: string;
      alt: string;
      sort_order: number;
      width: number;
      height: number;
      aspect: number;
      transparent: boolean;
    }
  | {
      kind: "video";
      id: string;
      src: string;
      poster: string;
      alt: string;
      sort_order: number;
    };

export function getPublicPhotoItems(): GalleryItem[] {
  return LOCAL_PHOTOS.map((p) => ({
    kind: "photo" as const,
    id: p.id,
    src: p.storage_path,
    alt: p.alt,
    sort_order: p.sort_order,
    width: p.width,
    height: p.height,
    aspect: p.aspect,
    transparent: p.transparent,
  }));
}

/** @deprecated prefer getPublicPhotoItems + LOCAL_VIDEOS separados */
export function getPublicGalleryItems(): GalleryItem[] {
  return getPublicPhotoItems();
}
