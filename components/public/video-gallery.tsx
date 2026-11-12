"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LocalVideo } from "@/lib/local-media";

/** Sección de videos aparte de la galería de fotos. */
export function VideoGallery({ videos }: { videos: LocalVideo[] }) {
  const [active, setActive] = useState(0);
  if (!videos.length) return null;

  const main = videos[Math.min(active, videos.length - 1)];
  const hasAudio = main.id === "vid-01";

  return (
    <div className="space-y-4">
      <div className="mx-auto w-full max-w-sm overflow-hidden bg-black">
        <video
          key={main.id}
          className="aspect-[9/16] max-h-[70vh] w-full object-contain"
          controls
          playsInline
          preload="metadata"
          poster={main.poster}
          muted={!hasAudio}
          aria-label={main.alt}
        >
          <source src={main.src} type="video/mp4" />
        </video>
      </div>

      {videos.length > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto pb-1">
          {videos.map((v, i) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative h-28 w-16 shrink-0 overflow-hidden bg-transparent ring-offset-2 ring-offset-background transition",
                i === active ? "ring-2 ring-ink" : "opacity-80 hover:opacity-100"
              )}
            >
              <Image
                src={v.poster}
                alt={v.alt}
                fill
                className="object-cover"
                sizes="64px"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                <Play className="h-5 w-5 fill-white text-white" aria-hidden />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
