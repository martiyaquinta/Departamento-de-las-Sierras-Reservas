"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatARS } from "@/lib/utils";

export function StickyCta({
  priceFrom,
  priceOneNight,
}: {
  priceFrom: number;
  priceOneNight?: number | null;
}) {
  const showPromo =
    priceOneNight != null && priceOneNight > 0 && priceOneNight > priceFrom;

  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
        // hide when scrolling down past a bit; show on up or near top
        if (y < 48) {
          setHidden(false);
        } else if (delta > 6) {
          setHidden(true);
        } else if (delta < -6) {
          setHidden(false);
        }
        lastY.current = y;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={
        "fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/98 px-3 pt-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-out md:hidden " +
        (hidden ? "translate-y-[110%] pointer-events-none" : "translate-y-0")
      }
      aria-hidden={hidden}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-terracota">
            Descuento estadía
          </p>
          <p className="truncate text-sm font-semibold leading-tight text-ink">
            {formatARS(priceFrom)}
            <span className="text-[11px] font-normal text-muted-foreground"> / noche · 2+</span>
          </p>
          {showPromo && (
            <p className="truncate text-[11px] text-muted-foreground">
              <span className="line-through decoration-ink/40">{formatARS(priceOneNight)}</span>
              <span className="ml-1">· 1 noche</span>
            </p>
          )}
        </div>
        <Link
          href="/reservar"
          tabIndex={hidden ? -1 : undefined}
          className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
        >
          Reservar
        </Link>
      </div>
    </div>
  );
}
