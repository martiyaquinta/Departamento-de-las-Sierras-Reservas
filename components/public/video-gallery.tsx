"use client";

import { useEffect, useRef } from "react";
import type { LocalVideo } from "@/lib/local-media";

/** Clips en loop: scroll horizontal en mobile, grilla en desktop. */
export function VideoGallery({ videos }: { videos: LocalVideo[] }) {
  if (!videos.length) return null;

  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
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
    <div className="relative aspect-[9/16] w-[42vw] max-w-[200px] shrink-0 snap-center overflow-hidden bg-transparent sm:w-auto sm:max-w-none sm:snap-none">
      <video
        ref={ref}
        className="h-full w-full object-cover"
        src={video.src}
        poster={video.poster}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        aria-label={video.alt}
      />
    </div>
  );
}
