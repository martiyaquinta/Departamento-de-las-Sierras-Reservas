"use client";

import { useEffect, useRef } from "react";
import type { LocalVideo } from "@/lib/local-media";

/** Tres clips siempre en loop — se ven como fotos en movimiento, sin chrome de player. */
export function VideoGallery({ videos }: { videos: LocalVideo[] }) {
  if (!videos.length) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {videos.map((v) => (
        <LoopClip key={v.id} video={v} />
      ))}
    </div>
  );
}

function LoopClip({ video }: { video: LocalVideo }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tryPlay = () => {
      el.muted = true;
      el.playsInline = true;
      const p = el.play();
      if (p && typeof p.catch === "function") p.catch(() => undefined);
    };

    tryPlay();
    el.addEventListener("loadeddata", tryPlay);
    el.addEventListener("canplay", tryPlay);

    const onVis = () => {
      if (document.hidden) el.pause();
      else tryPlay();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      el.removeEventListener("loadeddata", tryPlay);
      el.removeEventListener("canplay", tryPlay);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [video.src]);

  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[280px] overflow-hidden bg-transparent sm:max-w-none">
      <video
        ref={ref}
        className="h-full w-full object-cover"
        src={video.src}
        poster={video.poster}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        // sin controls → no se ve como “video player”
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        aria-label={video.alt}
      />
    </div>
  );
}
