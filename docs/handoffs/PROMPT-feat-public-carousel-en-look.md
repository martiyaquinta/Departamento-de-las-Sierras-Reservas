# feat: carrusel fotos auto + look tipo Landing EN (sin rosa/arena)

Repo: `/home/marti/Documentos/Estudio Nomade/CM/Centro De Las Sierras/web-reservas`
Base: trabajar sobre el tip actual de la rama de visual (hoy `feat/public-visual-redesign-anti-slop`) o `origin/main` si ya mergeó — **check `git status` primero**.
Branch nueva sugerida: `feat/public-carousel-en-look`
GH author/push: **martiyaquinta**
Package: **pnpm** · cwd **siempre** `web-reservas/` (el parent no tiene script `dev`)
Prod: https://departamentodelassierras.vercel.app
No secrets / no `.env.local` / no `git add -A`

---

## Síntoma (palabras humanas)

1. Las imágenes en **“El lugar”** no gustan: quiere **carrusel una al lado de la otra** que **se pase solo**, **sin fondo** (el color **rosa/arena** se ve horrible).
2. **No le gusta el stack / look actual** (beige shadcn + frames rosa + galería contain). Quiere algo **medio parecido a la landing de Estudio Nómade**.
3. Pedido: **prompt para otro agente** (este archivo).

---

## Decisión de stack (LOCKED — no debatir)

### Backend / producto
**NO migrar a Django, Astro greenfield, ni SPA aparte.**

Razones:
- Ya hay Next 15 + Supabase + PWA + admin + iCal Booking + WA + pricing findes en prod.
- La landing EN **también es Next + Tailwind + React** (`~/Documentos/Estudio Nomade/Landingpage/`). “Parecerse a EN” = **visual + motion + tipografía**, no cambiar de framework.
- Reescribir backend = semanas sin ganar reservas.

### Qué sí cambia (el “stack visual”)
Sacar la piel **beige/arena/rosa shadcn hospitality genérica** y acercar el **chrome público** al craft de EN Landing:

| Token EN (referencia) | Path |
|----------------------|------|
| Repo | `/home/marti/Documentos/Estudio Nomade/Landingpage` |
| CSS | `src/app/globals.css` — bg `#030308`, display **Space Grotesk**, body **Inter**, violet `#a78bfa` / `#8b5cf6` |
| Motion | `framer-motion` + a veces `gsap` en EN |
| Carousel dual proyectos | `src/components/projects/projects.tsx` — snap + arrows + dots |

### Adaptación hospitality (no clonar violet cosmic a ciegas)

El depto **no es la agencia**. Tomar de EN:

- Tipografía: **Space Grotesk** (títulos) + **Inter** (cuerpo) — o Fraunces solo si queda editorial limpio; **sacar Nunito “cute”** si sigue.
- Composición: **mucho aire, tipografía fuerte, media full-bleed**, CTAs claros, sin cards Lucide 3×.
- Carrusel: **snap horizontal**, peeks de slides vecinos, **autoplay**, dots mínimos.
- Motion sutil (`prefers-reduced-motion`).

**NO copiar a ciegas en la web del depto:**
- Starfield / glass violeta / gradient text shine de EN (queda “SaaS agencia”, no alquiler Tandil).
- Fondo rosa/arena `#e8d5c4` / `#f3ede3` como cajas detrás de fotos (**prohibido**).

**Paleta pública objetivo (hospitality limpia, no rosa):**

```text
--bg:        #ffffff   (o #fafafa)
--ink:       #111111 / #1a1a1a
--muted:     #5c5c5c
--line:      #e8e8e8
--accent:    terracota brand existente #c47a4a O un acento sobrio #2f2a26
--photo-bg:  transparent | #000 solo si letterbox de video — NUNCA arena/rosa
```

Si el peer cree que “hay que Django”: **parar y reportar**.

---

## Media SoT (ya en repo — no re-inventar)

| Qué | Path |
|-----|------|
| Catálogo | `lib/local-media.ts` — `LOCAL_PHOTOS`, `LOCAL_VIDEOS`, `LOCAL_HERO_PATH`, `getPublicPhotoItems()` |
| Fotos | `public/photos/depto-01…12.jpg`, `depto-hero.jpg` (casi todas **portrait** 720×1280; hero/03 landscape) |
| Videos | `public/videos/depto-01.mp4` (**con audio** ~10s), `depto-02/03.mp4` (**sin audio**), posters |
| Galería actual | `components/public/gallery.tsx` (contain + fondo arena — **a reemplazar**) |
| Videos sección | `components/public/video-gallery.tsx` |
| Home | `app/(public)/page.tsx` |
| Tokens CSS | `app/globals.css` (`--arena` / `--beige` = el “rosa” que odia) |
| Header | `components/public/site-header.tsx` |
| Fuente dump | `../fotosdepto/` |

**Reglas media que no romper:**
- Hero público = `LOCAL_HERO_PATH` (sin logo en la foto).
- Home **no** debe volver a depender solo de Supabase `photos` para la galería pública.
- Videos en **sección aparte** (`#videos`), no mezclados con fotos.
- Capacidad **2 a 3 personas**; precio promo **Descuento por estadía prolongada**; WA `5492266515776`; findes vie→dom.

---

## Qué construir

### A. Carrusel de fotos (“El lugar”)

Reemplazar el viewer actual por un **carrusel horizontal**:

1. Track `display:flex; overflow-x:auto; scroll-snap-type:x mandatory`.
2. Cada slide: foto **completa visible** (`object-contain` o altura fija tipo `h-[70vh]` / `min-w-[78vw] sm:min-w-[42vw]` con snap-center) — **sin caja rosa detrás**. Fondo del track = **blanco / transparente** (mismo `--bg` de página).
3. **Una al lado de la otra**: se debe ver un **peek** del slide siguiente/anterior (no full-bleed single hide-all).
4. **Autoplay**: avanza solo cada ~3.5–4.5s; pausa en hover/focus/touch; respeta `prefers-reduced-motion` (autoplay off).
5. Controles: dots o fraction discreto; flechas opcionales desktop; swipe móvil nativo.
6. Thumbs opcionales debajo **sin** fondo rosa; o solo dots.
7. Loop infinito o wrap al final.
8. No `bg-arena`, no `bg-crema` en el marco de la foto, no padding rosa.

Implementación sugerida (KISS):
- Client component nuevo p.ej. `components/public/photo-carousel.tsx` (o reescribir `gallery.tsx`).
- `useEffect` + `scrollTo` / `scrollBy` con `behavior: 'smooth'` sobre el contenedor snap; o `framer-motion` si ya se agrega dep (EN la usa) — **no** meter Embla/Swiper si con CSS snap + 40 líneas alcanza.
- Datos: `getPublicPhotoItems()` / `LOCAL_PHOTOS`.

### B. Look página tipo EN (público only)

1. `app/layout.tsx` / fonts: cargar **Space Grotesk + Inter** (como EN).
2. `globals.css`: redefinir tokens públicos — **eliminar dominio visual rosa/arena** en superficies grandes (`background`, cards de galería, muted strips). Admin puede quedar con tokens viejos si hace falta scoped `:root` vs `.admin` — preferí **no romper admin**; si hace falta, scope dark/clean solo en `app/(public)/layout.tsx` wrapper class `public-shell`.
3. Home sections: tipografía display EN-like; menos `rounded` shadcn grueso; CTAs tipo pill o rectangulares sobrios.
4. Header sticky limpio: logo + **De Las Sierras** + Reservar — sin blur rosa.
5. Sticky CTA coherente con nueva paleta.
6. Videos: mantener sección aparte; player sin marco rosa.

### C. Fuera de scope

- Django / nuevo monorepo
- Cambiar reglas booking / iCal / admin auth
- Clonar starfield/glass violeta EN completo
- Re-subir media a Supabase (local catalog OK)
- Traducción EN
- Mega design-system tokens file si con globals alcanza

---

## Anti-slop

- No feature grid 3× Lucide
- No glassmorphism gratis
- No “experiencia única / oasis”
- No fondo decorativo rosa/peach/arena detrás de fotos
- No Inter-only default sin display font
- Surface = **Explore hospitality** + media carousel, no SaaS pricing page

Referencias posture (no clonar UI propietaria): EN Landing craft + Airbnb listing photo strip.

---

## Archivos a tocar (esperados)

- `components/public/gallery.tsx` y/o nuevo `photo-carousel.tsx`
- `components/public/video-gallery.tsx` (quitar fondos feos)
- `app/(public)/page.tsx`
- `app/(public)/layout.tsx` y/o `app/layout.tsx` (fonts)
- `app/globals.css` (+ opcional shell class)
- `components/public/site-header.tsx`, `sticky-cta.tsx`
- `package.json` solo si se agrega `framer-motion` (opcional)

Leer antes: `lib/local-media.ts`, page actual, EN `Landingpage/src/app/globals.css` + `projects/projects.tsx` (patrón snap).

---

## Criterios de aceptación

- [ ] “El lugar”: carrusel **horizontal**, slides **lado a lado** con peek, **autoplay**, swipe OK
- [ ] **Cero** fondo rosa/arena detrás de fotos (inspeccionar computed background del track)
- [ ] Fotos se ven enteras o con crop mínimo consciente (portrait-first); no caja contain con padding rosa
- [ ] Videos siguen en sección **aparte**; 01 con audio, 02/03 mute
- [ ] Tipografía / spacing / chrome se sienten **familia EN** (Grotesk+Inter, limpio) sin copiar starfield violeta
- [ ] Hero sin logo; precio promo + 2–3 personas + findes intactos
- [ ] `pnpm typecheck` OK; smoke localhost móvil + desktop
- [ ] Stack sigue Next+Supabase en el mismo repo

---

## Verify

```bash
cd "/home/marti/Documentos/Estudio Nomade/CM/Centro De Las Sierras/web-reservas"
pnpm typecheck
pnpm test
pnpm dev
# http://localhost:3000 — hard refresh
# Comprobar #fotos autoplay + peek; #videos aparte; no bg rosa
```

Opcional: mirar EN en paralelo `Landingpage` `npm run dev` solo como referencia visual (otro puerto).

---

## Entrega

1. Branch + commits claros (`feat(public): carousel autoplay + en-like shell`)
2. PR summary: carrusel + paleta sin arena + fonts EN-like; **no** stack backend change
3. Screenshots before/after móvil
4. **No merge** sin OK visual de la humana
5. Reportar localhost URL + 5 bullets

KISS: un carousel bien hecho > librería pesada. DRY: una fuente de fotos = `LOCAL_PHOTOS`.
