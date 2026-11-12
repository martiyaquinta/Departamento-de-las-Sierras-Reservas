import type { Photo } from "@/lib/types";

/** Hero público: vista Tandil (fotosdepto/tandil.png). */
export const LOCAL_HERO_PATH = "/photos/tandil.png";

/**
 * Galería pública = todas las imágenes de fotosdepto → public/photos.
 * (videos aparte en LOCAL_VIDEOS)
 */
export const LOCAL_PHOTOS: Photo[] = [
  {
    id: "local-01",
    storage_path: "/photos/depto-01.jpg",
    alt: "Departamento de las Sierras",
    sort_order: 0,
    is_cover: false,
    created_at: "2026-11-12T00:00:00.000Z",
  },
  {
    id: "local-02",
    storage_path: "/photos/depto-02.jpg",
    alt: "Departamento de las Sierras",
    sort_order: 1,
    is_cover: false,
    created_at: "2026-11-12T00:00:00.000Z",
  },
  {
    id: "local-03",
    storage_path: "/photos/depto-03.jpg",
    alt: "Departamento de las Sierras — ambiente",
    sort_order: 2,
    is_cover: true,
    created_at: "2026-11-12T00:00:00.000Z",
  },
  {
    id: "local-04",
    storage_path: "/photos/depto-04.jpg",
    alt: "Departamento de las Sierras",
    sort_order: 3,
    is_cover: false,
    created_at: "2026-11-12T00:00:00.000Z",
  },
  {
    id: "local-05",
    storage_path: "/photos/depto-05.jpg",
    alt: "Departamento de las Sierras",
    sort_order: 4,
    is_cover: false,
    created_at: "2026-11-12T00:00:00.000Z",
  },
  {
    id: "local-06",
    storage_path: "/photos/depto-06.jpg",
    alt: "Departamento de las Sierras",
    sort_order: 5,
    is_cover: false,
    created_at: "2026-11-12T00:00:00.000Z",
  },
  {
    id: "local-07",
    storage_path: "/photos/depto-07.jpg",
    alt: "Departamento de las Sierras",
    sort_order: 6,
    is_cover: false,
    created_at: "2026-11-12T00:00:00.000Z",
  },
  {
    id: "local-08",
    storage_path: "/photos/depto-08.jpg",
    alt: "Departamento de las Sierras",
    sort_order: 7,
    is_cover: false,
    created_at: "2026-11-12T00:00:00.000Z",
  },
  {
    id: "local-09",
    storage_path: "/photos/depto-09.jpg",
    alt: "Departamento de las Sierras",
    sort_order: 8,
    is_cover: false,
    created_at: "2026-11-12T00:00:00.000Z",
  },
  {
    id: "local-10",
    storage_path: "/photos/depto-10.jpg",
    alt: "Departamento de las Sierras",
    sort_order: 9,
    is_cover: false,
    created_at: "2026-11-12T00:00:00.000Z",
  },
  {
    id: "local-11",
    storage_path: "/photos/depto-11.jpg",
    alt: "Departamento de las Sierras",
    sort_order: 10,
    is_cover: false,
    created_at: "2026-11-12T00:00:00.000Z",
  },
  {
    id: "local-12",
    storage_path: "/photos/depto-12.jpg",
    alt: "Departamento de las Sierras",
    sort_order: 11,
    is_cover: false,
    created_at: "2026-11-12T00:00:00.000Z",
  },
  {
    id: "local-13",
    storage_path: "/photos/depto-13.jpg",
    alt: "Departamento de las Sierras",
    sort_order: 12,
    is_cover: false,
    created_at: "2026-09-05T00:00:00.000Z",
  },
  {
    id: "local-14",
    storage_path: "/photos/depto-14.jpg",
    alt: "Departamento de las Sierras",
    sort_order: 13,
    is_cover: false,
    created_at: "2026-09-06T00:00:00.000Z",
  },
  {
    id: "local-15",
    storage_path: "/photos/depto-15.jpg",
    alt: "Departamento de las Sierras",
    sort_order: 14,
    is_cover: false,
    created_at: "2026-09-06T00:00:00.000Z",
  },
  {
    id: "local-16",
    storage_path: "/photos/depto-16.jpg",
    alt: "Departamento de las Sierras",
    sort_order: 15,
    is_cover: false,
    created_at: "2026-09-06T00:00:00.000Z",
  },
  {
    id: "local-17",
    storage_path: "/photos/depto-17.jpg",
    alt: "Departamento de las Sierras",
    sort_order: 16,
    is_cover: false,
    created_at: "2026-09-06T00:00:00.000Z",
  },
  {
    id: "local-18",
    storage_path: "/photos/depto-18.png",
    alt: "Vista de Tandil",
    sort_order: 17,
    is_cover: false,
    created_at: "2026-11-12T00:00:00.000Z",
  },
];

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
  | { kind: "photo"; id: string; src: string; alt: string; sort_order: number }
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
    alt: p.alt ?? "Departamento de las Sierras",
    sort_order: p.sort_order,
  }));
}

/** @deprecated prefer getPublicPhotoItems + LOCAL_VIDEOS separados */
export function getPublicGalleryItems(): GalleryItem[] {
  return getPublicPhotoItems();
}
