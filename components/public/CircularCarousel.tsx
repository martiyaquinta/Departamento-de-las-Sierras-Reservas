"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/utils";

export type CircularCarouselItem = {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
};

type AutoplayMode = false | "drift" | "step";
type Direction = "left" | "right";
type Intro = false | "rise" | "fade";
type Preset = "cylinder" | "flat";

export type CircularCarouselProps = {
  items: CircularCarouselItem[];
  preset?: Preset;
  intro?: Intro;
  cardWidth?: number;
  aspectRatio?: number;
  speed?: number;
  captions?: boolean;
  gap?: number;
  tilt?: number;
  curve?: number;
  perspective?: number;
  autoplay?: AutoplayMode;
  interval?: number;
  direction?: Direction;
  momentum?: number;
  snap?: boolean;
  pauseOnHover?: boolean;
  focusOnClick?: boolean;
  draggable?: boolean;
  parallax?: number;
  stretch?: number;
  fadeColor?: string;
  depthFade?: number;
  innerShade?: number;
  cornerRadius?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Carrusel 3D tipo cilindro: fotos pegadas en arco, sin franjas blancas entre slides.
 * API alineada al snippet de referencia (cylinder + drift).
 */
export default function CircularCarousel({
  items,
  preset = "cylinder",
  intro = "rise",
  cardWidth = 220,
  aspectRatio = 0.72,
  speed = 14,
  captions = false,
  gap = 25,
  tilt = -5,
  curve = 1,
  perspective = 2500,
  autoplay = "drift",
  interval = 3,
  direction = "left",
  momentum = 0.6,
  snap = true,
  pauseOnHover = true,
  focusOnClick = true,
  draggable = true,
  parallax = 0.3,
  stretch = 0.5,
  fadeColor = "#ffffff",
  depthFade = 0.55,
  innerShade = 0.6,
  cornerRadius = 12,
  className,
  style,
}: CircularCarouselProps) {
  const n = items.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const velRef = useRef(0);
  const rafRef = useRef(0);
  const dragRef = useRef<{ id: number; x: number; a0: number; moved: boolean } | null>(null);
  const pausedRef = useRef(false);
  const reduceRef = useRef(false);
  const [angle, setAngle] = useState(0);
  const [ready, setReady] = useState(intro === false);
  const [active, setActive] = useState(0);

  const cardH = cardWidth / Math.max(aspectRatio, 0.2);
  const step = n > 0 ? 360 / n : 360;
  const radius = useMemo(() => {
    if (n < 2) return cardWidth;
    const chord = cardWidth + gap;
    const r = chord / (2 * Math.sin(Math.PI / n));
    return Math.max(r * (0.85 + curve * 0.35), cardWidth * 1.1);
  }, [n, cardWidth, gap, curve]);

  const dirSign = direction === "left" ? 1 : -1;
  const driftPerSec = autoplay === "drift" ? (speed * 0.35 * dirSign) : 0;
  const stepMs = Math.max(1.2, interval) * 1000;

  const nearestIndex = useCallback(
    (a: number) => {
      if (n < 1) return 0;
      const normalized = ((-a % 360) + 360) % 360;
      return Math.round(normalized / step) % n;
    },
    [n, step]
  );

  const snapTo = useCallback(
    (index: number) => {
      if (n < 1) return;
      const i = ((index % n) + n) % n;
      const target = -i * step;
      // shortest path from current angle
      let cur = angleRef.current;
      const delta = ((((target - cur) % 360) + 540) % 360) - 180;
      angleRef.current = cur + delta;
      velRef.current = 0;
      setAngle(angleRef.current);
      setActive(i);
    },
    [n, step]
  );

  useEffect(() => {
    reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (intro === false || reduceRef.current) {
      setReady(true);
      return;
    }
    const t = window.setTimeout(() => setReady(true), 40);
    return () => window.clearTimeout(t);
  }, [intro]);

  useEffect(() => {
    if (n < 2) return;
    let last = performance.now();
    let stepAcc = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const paused = pausedRef.current || reduceRef.current;
      const dragging = dragRef.current?.moved;

      if (!paused && !dragging) {
        if (autoplay === "drift" && !reduceRef.current) {
          velRef.current = driftPerSec;
        } else if (autoplay === "step" && !reduceRef.current) {
          stepAcc += dt * 1000;
          if (stepAcc >= stepMs) {
            stepAcc = 0;
            snapTo(nearestIndex(angleRef.current) + dirSign);
          }
        } else if (snap && Math.abs(velRef.current) < 0.15) {
          // settle toward nearest
          const i = nearestIndex(angleRef.current);
          const target = -i * step;
          let cur = angleRef.current;
          const delta = ((((target - cur) % 360) + 540) % 360) - 180;
          angleRef.current = cur + delta * Math.min(1, dt * 6);
          velRef.current *= Math.pow(1 - momentum, dt * 12);
        } else {
          velRef.current *= Math.pow(1 - Math.min(0.95, 0.35 + momentum * 0.5), dt * 10);
        }

        if (Math.abs(velRef.current) > 0.001) {
          angleRef.current += velRef.current * dt;
        }
      }

      setAngle(angleRef.current);
      setActive(nearestIndex(angleRef.current));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [n, autoplay, driftPerSec, stepMs, dirSign, snap, momentum, nearestIndex, snapTo, step]);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (!draggable || e.button !== 0 || n < 2) return;
    dragRef.current = { id: e.pointerId, x: e.clientX, a0: angleRef.current, moved: false };
    velRef.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 4) d.moved = true;
    if (!d.moved) return;
    const sens = 0.18 + stretch * 0.12;
    angleRef.current = d.a0 + dx * sens;
    velRef.current = dx * sens * 0.08;
    setAngle(angleRef.current);
  };

  const endDrag = (e: ReactPointerEvent) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    dragRef.current = null;
    if (d.moved && snap) {
      snapTo(nearestIndex(angleRef.current));
    }
  };

  const onItemClick = (index: number) => {
    if (dragRef.current?.moved) return;
    if (focusOnClick) snapTo(index);
  };

  if (!n) return null;

  const isCylinder = preset === "cylinder";

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative w-full touch-pan-y select-none overflow-hidden",
        ready ? "opacity-100" : "opacity-0",
        intro === "rise" && ready && "transition-opacity duration-700",
        className
      )}
      style={{
        height: Math.max(cardH * 1.35, 420),
        perspective: `${perspective}px`,
        perspectiveOrigin: "50% 45%",
        ...style,
      }}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Fotos del lugar"
      onMouseEnter={() => {
        if (pauseOnHover) pausedRef.current = true;
      }}
      onMouseLeave={() => {
        if (pauseOnHover) pausedRef.current = false;
      }}
      onFocusCapture={() => {
        if (pauseOnHover) pausedRef.current = true;
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null) && pauseOnHover) {
          pausedRef.current = false;
        }
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* edge fades — same page bg, hides harsh cutoffs without pink/arena */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[12%]"
        style={{
          background: `linear-gradient(90deg, ${fadeColor} 0%, transparent 100%)`,
          opacity: depthFade,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[12%]"
        style={{
          background: `linear-gradient(270deg, ${fadeColor} 0%, transparent 100%)`,
          opacity: depthFade,
        }}
        aria-hidden
      />

      <div
        className="absolute left-1/2 top-1/2 h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          transform: isCylinder
            ? `translate(-50%, -50%) rotateX(${tilt}deg) rotateY(${angle}deg)`
            : `translate(-50%, -50%) translateX(${(-angle / step) * (cardWidth + gap)}px)`,
          transition: intro === "rise" && !ready ? undefined : undefined,
        }}
      >
        {items.map((item, i) => {
          const itemAngle = i * step;
          const rel = ((itemAngle + angle) % 360 + 360) % 360;
          const delta = rel > 180 ? rel - 360 : rel;
          const abs = Math.abs(delta);
          const front = 1 - Math.min(1, abs / 90);
          const zBoost = parallax * 40 * front;
          const shade = innerShade * (1 - front);
          const scale = 0.82 + front * 0.18;

          return (
            <button
              key={`${item.src}-${i}`}
              type="button"
              onClick={() => onItemClick(i)}
              className="absolute left-1/2 top-1/2 origin-center overflow-hidden border-0 bg-transparent p-0 shadow-[0_18px_40px_rgba(0,0,0,0.18)] outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
              style={{
                width: cardWidth,
                height: cardH,
                marginLeft: -cardWidth / 2,
                marginTop: -cardH / 2,
                borderRadius: cornerRadius,
                transform: isCylinder
                  ? `rotateY(${itemAngle}deg) translateZ(${radius + zBoost}px) scale(${scale})`
                  : `translateX(${i * (cardWidth + gap) - ((n - 1) * (cardWidth + gap)) / 2}px) scale(${scale})`,
                transformStyle: "preserve-3d",
                zIndex: Math.round(front * 100),
                opacity: 0.35 + front * 0.65,
              }}
              aria-label={item.alt || item.title || `Foto ${i + 1}`}
              aria-current={i === active}
            >
              <span className="relative block h-full w-full overflow-hidden" style={{ borderRadius: cornerRadius }}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover"
                  sizes={`${cardWidth}px`}
                  priority={i < 3}
                  draggable={false}
                />
                {shade > 0.02 && (
                  <span
                    className="pointer-events-none absolute inset-0"
                    style={{ background: `rgba(0,0,0,${shade})` }}
                    aria-hidden
                  />
                )}
              </span>
              {captions && (item.title || item.subtitle) && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8 text-left text-white">
                  {item.title && <span className="block text-sm font-semibold">{item.title}</span>}
                  {item.subtitle && (
                    <span className="block text-xs opacity-80">{item.subtitle}</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {n > 1 && (
        <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-1.5">
          {items.map((item, i) => (
            <button
              key={`dot-${item.src}-${i}`}
              type="button"
              aria-label={`Ir a foto ${i + 1}`}
              aria-current={i === active}
              onClick={() => snapTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === active ? "w-5 bg-ink" : "w-1.5 bg-ink/25 hover:bg-ink/45"
              )}
            />
          ))}
          <span className="ml-2 text-[11px] tabular-nums text-muted-foreground">
            {active + 1}/{n}
          </span>
        </div>
      )}
    </div>
  );
}
