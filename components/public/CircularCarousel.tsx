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
  /** width/height nativo de la foto */
  aspectRatio?: number;
};

type AutoplayMode = false | "drift" | "step";
type Direction = "left" | "right";
type Intro = false | "rise" | "fade";
type Preset = "cylinder" | "flat";

export type CircularCarouselProps = {
  items: CircularCarouselItem[];
  preset?: Preset;
  intro?: Intro;
  /** Altura fija de cada tarjeta; el ancho sale del aspect de cada foto */
  cardHeight?: number;
  /** @deprecated use cardHeight + per-item aspectRatio */
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
 * Carrusel 3D cilindro — arrastrable (mouse/touch), snap, drift autoplay.
 */
export default function CircularCarousel({
  items,
  preset = "cylinder",
  intro = "rise",
  cardHeight,
  cardWidth = 220,
  aspectRatio = 0.562,
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
  const dragRef = useRef<{
    id: number;
    x: number;
    a0: number;
    moved: boolean;
    samples: { x: number; t: number }[];
  } | null>(null);
  const userControlRef = useRef(false);
  const userControlUntilRef = useRef(0);
  const pausedRef = useRef(false);
  const reduceRef = useRef(false);
  const [angle, setAngle] = useState(0);
  const [ready, setReady] = useState(intro === false);
  const [active, setActive] = useState(0);
  const [grabbing, setGrabbing] = useState(false);

  const cardH = cardHeight ?? cardWidth / Math.max(aspectRatio, 0.2);
  const itemSize = useCallback(
    (item: CircularCarouselItem) => {
      const ar = Math.max(0.35, Math.min(2.4, item.aspectRatio ?? aspectRatio));
      const h = cardH;
      const w = h * ar;
      return { w, h, ar };
    },
    [cardH, aspectRatio]
  );
  const avgW = useMemo(() => {
    if (!n) return cardWidth;
    const sum = items.reduce((acc, it) => acc + itemSize(it).w, 0);
    return sum / n;
  }, [items, n, itemSize, cardWidth]);
  const step = n > 0 ? 360 / n : 360;
  const radius = useMemo(() => {
    if (n < 2) return avgW;
    const chord = avgW + gap;
    const r = chord / (2 * Math.sin(Math.PI / n));
    return Math.max(r * (0.85 + curve * 0.35), avgW * 1.05);
  }, [n, avgW, gap, curve]);

  const dirSign = direction === "left" ? 1 : -1;
  const driftPerSec = autoplay === "drift" ? speed * 0.35 * dirSign : 0;
  const stepMs = Math.max(1.2, interval) * 1000;
  /** deg per px drag — higher = easier to fling through photos */
  const dragSens = 0.42 + stretch * 0.35;

  const nearestIndex = useCallback(
    (a: number) => {
      if (n < 1) return 0;
      const normalized = ((-a % 360) + 360) % 360;
      return Math.round(normalized / step) % n;
    },
    [n, step]
  );

  const snapTo = useCallback(
    (index: number, soft = false) => {
      if (n < 1) return;
      const i = ((index % n) + n) % n;
      const target = -i * step;
      const cur = angleRef.current;
      const delta = ((((target - cur) % 360) + 540) % 360) - 180;
      if (soft) {
        // velocity toward target; tick settles
        velRef.current = delta * 4;
        userControlRef.current = true;
        userControlUntilRef.current = performance.now() + 900;
      } else {
        angleRef.current = cur + delta;
        velRef.current = 0;
        setAngle(angleRef.current);
      }
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
      const dragging = Boolean(dragRef.current?.moved);
      const hoverPaused = pausedRef.current && !dragging && !userControlRef.current;
      const userActive = userControlRef.current || now < userControlUntilRef.current;

      if (!dragging) {
        if (userActive) {
          // coast + optional snap settle after user drag
          angleRef.current += velRef.current * dt;
          const friction = Math.pow(1 - Math.min(0.92, 0.25 + momentum * 0.55), dt * 10);
          velRef.current *= friction;

          if (snap && Math.abs(velRef.current) < 8) {
            const i = nearestIndex(angleRef.current);
            const target = -i * step;
            const cur = angleRef.current;
            const delta = ((((target - cur) % 360) + 540) % 360) - 180;
            angleRef.current = cur + delta * Math.min(1, dt * 8);
            if (Math.abs(delta) < 0.35 && Math.abs(velRef.current) < 1.5) {
              angleRef.current = target;
              velRef.current = 0;
              userControlRef.current = false;
              userControlUntilRef.current = 0;
            }
          } else if (!snap && Math.abs(velRef.current) < 0.4) {
            userControlRef.current = false;
            userControlUntilRef.current = 0;
          }
        } else if (!hoverPaused && !reduceRef.current) {
          if (autoplay === "drift") {
            velRef.current = driftPerSec;
            angleRef.current += velRef.current * dt;
          } else if (autoplay === "step") {
            stepAcc += dt * 1000;
            if (stepAcc >= stepMs) {
              stepAcc = 0;
              snapTo(nearestIndex(angleRef.current) + dirSign, true);
            }
          }
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
    // ignore dots / controls
    if ((e.target as HTMLElement).closest("[data-carousel-ui]")) return;

    e.preventDefault();
    userControlRef.current = true;
    userControlUntilRef.current = performance.now() + 60_000;
    velRef.current = 0;
    dragRef.current = {
      id: e.pointerId,
      x: e.clientX,
      a0: angleRef.current,
      moved: false,
      samples: [{ x: e.clientX, t: performance.now() }],
    };
    setGrabbing(true);
    rootRef.current?.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 3) d.moved = true;
    if (!d.moved) return;

    angleRef.current = d.a0 + dx * dragSens;
    d.samples.push({ x: e.clientX, t: performance.now() });
    if (d.samples.length > 6) d.samples.shift();

    // live velocity from recent samples
    if (d.samples.length >= 2) {
      const a = d.samples[0];
      const b = d.samples[d.samples.length - 1];
      const span = Math.max(b.t - a.t, 16);
      const pxPerSec = ((b.x - a.x) / span) * 1000;
      velRef.current = pxPerSec * dragSens * 0.85;
    }
    setAngle(angleRef.current);
  };

  const endDrag = (e: ReactPointerEvent) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    dragRef.current = null;
    setGrabbing(false);

    if (!d.moved) {
      // tap: focus clicked card if any
      userControlUntilRef.current = performance.now() + 400;
      return;
    }

    userControlRef.current = true;
    userControlUntilRef.current = performance.now() + 2500;

    if (snap && Math.abs(velRef.current) < 40) {
      snapTo(nearestIndex(angleRef.current), true);
    }
  };

  const onItemActivate = (index: number) => {
    if (dragRef.current?.moved) return;
    if (!focusOnClick) return;
    userControlRef.current = true;
    userControlUntilRef.current = performance.now() + 2000;
    snapTo(index, true);
  };

  useEffect(() => {
    if (n < 2) return;
    const el = rootRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        userControlRef.current = true;
        userControlUntilRef.current = performance.now() + 2000;
        snapTo(nearestIndex(angleRef.current) - 1, true);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        userControlRef.current = true;
        userControlUntilRef.current = performance.now() + 2000;
        snapTo(nearestIndex(angleRef.current) + 1, true);
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [n, nearestIndex, snapTo]);

  if (!n) return null;

  const isCylinder = preset === "cylinder";

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      className={cn(
        "relative w-full select-none overflow-hidden outline-none",
        grabbing ? "cursor-grabbing" : "cursor-grab",
        ready ? "opacity-100" : "opacity-0",
        intro === "rise" && ready && "transition-opacity duration-700",
        className
      )}
      style={{
        height: Math.max(cardH * 1.45, 360),
        perspective: `${perspective}px`,
        perspectiveOrigin: "50% 48%",
        touchAction: "none",
        ...style,
      }}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Fotos del lugar. Arrastrá o usá las flechas para ver más."
      onMouseEnter={() => {
        if (pauseOnHover) pausedRef.current = true;
      }}
      onMouseLeave={() => {
        if (pauseOnHover) pausedRef.current = false;
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
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
            : `translate(-50%, -50%) translateX(${(-angle / step) * (avgW + gap)}px)`,
          pointerEvents: "none",
        }}
      >
        {items.map((item, i) => {
          const { w: iw, h: ih } = itemSize(item);
          const itemAngle = i * step;
          const rel = ((itemAngle + angle) % 360 + 360) % 360;
          const delta = rel > 180 ? rel - 360 : rel;
          const abs = Math.abs(delta);
          const front = 1 - Math.min(1, abs / 90);
          const zBoost = parallax * 40 * front;
          const shade = innerShade * (1 - front);
          const scale = 0.88 + front * 0.12;

          return (
            <div
              key={`${item.src}-${i}`}
              role="button"
              tabIndex={-1}
              onClick={() => onItemActivate(i)}
              className="absolute left-1/2 top-1/2 origin-center overflow-visible"
              style={{
                width: iw,
                height: ih,
                marginLeft: -iw / 2,
                marginTop: -ih / 2,
                borderRadius: cornerRadius,
                pointerEvents: "auto",
                transform: isCylinder
                  ? `rotateY(${itemAngle}deg) translateZ(${radius + zBoost}px) scale(${scale})`
                  : `translateX(${i * (avgW + gap) - ((n - 1) * (avgW + gap)) / 2}px) scale(${scale})`,
                transformStyle: "preserve-3d",
                zIndex: Math.round(front * 100),
                opacity: 0.4 + front * 0.6,
                boxShadow: front > 0.55 ? "0 18px 40px rgba(0,0,0,0.16)" : "0 8px 20px rgba(0,0,0,0.08)",
              }}
              aria-label={item.alt || item.title || `Foto ${i + 1}`}
              aria-current={i === active}
            >
              <span
                className="relative block h-full w-full overflow-hidden bg-transparent"
                style={{ borderRadius: cornerRadius }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="pointer-events-none object-contain"
                  sizes={`${Math.round(iw * 1.6)}px`}
                  priority={i < 4}
                  draggable={false}
                />
                {shade > 0.02 && (
                  <span
                    className="pointer-events-none absolute inset-0"
                    style={{ background: `rgba(0,0,0,${shade * 0.45})` }}
                    aria-hidden
                  />
                )}
              </span>
              {captions && (item.title || item.subtitle) && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8 text-left text-white">
                  {item.title && <span className="block text-sm font-semibold">{item.title}</span>}
                  {item.subtitle && (
                    <span className="block text-xs opacity-80">{item.subtitle}</span>
                  )}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {n > 1 && (
        <div
          data-carousel-ui
          className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-1.5"
        >
          {items.map((item, i) => (
            <button
              key={`dot-${item.src}-${i}`}
              type="button"
              aria-label={`Ir a foto ${i + 1}`}
              aria-current={i === active}
              onClick={(e) => {
                e.stopPropagation();
                userControlRef.current = true;
                userControlUntilRef.current = performance.now() + 2000;
                snapTo(i, true);
              }}
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
