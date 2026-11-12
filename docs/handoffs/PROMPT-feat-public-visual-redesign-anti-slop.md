# feat: rediseño visual público anti-slop (hospitality, no SaaS genérico)

Repo: `/home/marti/Documentos/Estudio Nomade/CM/Centro De Las Sierras/web-reservas`
App: `web-reservas` (único package)
Base: `origin/main` (si la rama actual es otra, `git fetch` + branch nueva desde main limpio)
Branch: `feat/public-visual-redesign-anti-slop`
GH: `martiyaquinta/Departamento-de-las-Sierras-Reservas` (remote origin puede seguir como Centro-de-las-Sierras-Reservas; PRs al default)
Author/push: cuenta **martiyaquinta** (`gh auth switch --user martiyaquinta` si hace falta)
Prod: https://departamentodelassierras.vercel.app
No tocar secretos / `.env.local` / `.data/` / no `git add -A`

---

## Síntoma (palabras de la humana)

La web se siente **muy IA y genérica**. Quiere algo **llamativo y lindo** para que una persona turística **quiera alquilar el lugar**. Mencionó Django + React como idea de stack.

## Decisión de producto / stack (LOCKED — no debatir)

**NO migrar a Django + React.**

Motivos (no negociables en este handoff):

1. El producto **ya funciona** en prod: Next 15 + Supabase + PWA + admin + iCal bidireccional Booking + Resend + WhatsApp handoff + pricing 1 vs 2+ + findes-only.
2. Cambiar a Django+React es **reescribir backend, auth, deploy, PWA, cron Vercel, storage, RLS** sin ganar un huésped. Es 2–4 semanas de riesgo por un problema **visual**.
3. El problema no es “falta Python”: es composición de landing tipo **SaaS shadcn** (cards iguales, icon grid Lucide, hero genérico, copy inflado).

**Stack a mantener:**

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind v4 + componentes shadcn **solo como primitives** (Button/Dialog/etc.), no como look de la landing
- Supabase (mismo proyecto `cheioutcfptkxofojjva`)
- Vercel + PWA actual
- pnpm

**Alcance de este PR:** solo **superficie pública** (home, `/reservar`, header, sticky CTA, galería, gracias/fallback). Admin puede quedar casi igual (opcional polish mínimo si el contraste se rompe). **Cero** cambios de reglas de negocio, schema, iCal, pricing math, allowlist admin.

Si el peer cree que “hace falta Django”, **parar y reportar** — no scaffoldear otro monorepo.

---

## Superficie (claude-design — Surface-First)

Esto es un **Explore + Decide hospitality**:

- Primario: **Explore** (fotos del depto, vista a las sierras, sensación de lugar).
- Secundario: **Decide** (precio promo + CTA reservar / WhatsApp).

**NO es:**

- Monitor / Operate / SaaS landing
- “hero centrado + 3 feature cards con icono Lucide”
- dashboard con métricas inventadas
- glassmorphism / gradient blue-violet tech

Compromiso de composición (elegí **una** y ejecutala; no mezclar 4 estilos):

**Dirección canónica — “Revista de viaje + ficha Airbnb de un solo listing”:**

1. Full-bleed **hero foto real** (cover) con overlay suave y tipografía editorial (no card flotante genérica).
2. Debajo: **bloque identidad** corto (nombre + 1 línea de promesa + chips concretos: 2–3 personas · centro Tandil · solo findes).
3. **Galería photography-first** (masonry o carrusel grande, no thumbnails chicos con bordes beige idénticos).
4. **Una columna de historia del lugar** (vista balcón, caminable, finde) intercalada con 1–2 fotos full-width — no grilla 3×iconos.
5. **Amenities** como lista tipográfica densa o chips sobrios (no icon-topper card por amenity).
6. **Precio** como bloque editorial promo (ver reglas abajo), no como pricing table SaaS.
7. **CTA** fijo móvil: negro/marrón cálido o terracota — un solo verbo (“Reservar finde”).
8. Footer mínimo: dirección, WA, sin newsletter fake ni “Our story / Careers”.

Referencias de **postura** (principios, no clonar UI propietaria):

- Airbnb listing: foto hero, whitespace de revista, CTA claro, tipografía cálida.
- Apple/editorial travel: una idea por sección, tipografía grande, poca decoración.
- Brand propia: paleta beige/marrón/terracota de `app/globals.css` + assets en `../brand/`.

---

## Brand & assets (leer antes de codear)

| Qué | Path |
|-----|------|
| Paleta CSS actual | `app/globals.css` (`--marron #3c2a21`, `--terracota #c47a4a`, `--beige #f3ede3`, `--crema #faf6f0`, `--sage #7a8471`, `--mostaza #c99a3a`) |
| Fonts | layout: Nunito + Fraunces — **re-evaluar**: Fraunces/serif editorial OK; si Nunito se siente “AI cute”, preferir **DM Sans / Source Serif 4 / Fraunces** (máx 2 familias). Evitar Inter como default. |
| Logos | `../brand/logo_mark_*.png`, `logoDeLasSierras*.png` en carpeta padre |
| Dirección visual PDF | `../brand/Direccion-Visual-Departamento-de-las-Sierras.pdf` |
| Fotos prod | `public/photos/depto-hero.jpg` + `depto-01…04.jpg` + storage Supabase `property-photos` |
| Brief CM | `../docs/BRIEF-ESTRATEGICO-Centro-de-las-Sierras.md` · `../docs/ESTRATEGIA-CM-Departamento-de-las-Sierras.md` |
| Skill ops negocio | reglas abajo (copiar, no inventar) |

Header público label: **De Las Sierras** (no “Centro de las Sierras” largo en chrome).

---

## Reglas de negocio (NO inventar — hard lock)

- Solo findes por default: noches **vie + sáb**; check-in vie → checkout **dom** (2 noches típicas).
- Capacidad pública: **“2 a 3 personas”** — **sin** “2 adultos + 1 menor”.
- No pets.
- WhatsApp property: **5492266515776**
- Post-reserva: redirect a WhatsApp con payload (`buildWhatsAppUrl`) — gracias solo fallback.
- **Pricing UI (promo canónica):**
  1. Badge **Descuento por estadía prolongada**
  2. Grande: `price_per_night` / noche · **Con 2 o más noches** + “X% menos que la tarifa de 1 noche”
  3. Secundaria: 1 noche **tachada** + “(sin descuento)” si one > multi
  4. Sticky móvil: **Descuento estadía**, `priceFrom` = multi, 1 noche tachada debajo
  5. `/reservar` mismo framing
  6. Nunca “Desde = 1 noche” ni 1 noche más grande que multi
- Admin allowlist / iCal / Resend: **no tocar** en este PR.
- RLS: no cambiar data layer; `getActiveReservationsForBooking` sigue con service client.

Archivos de lógica a **preservar comportamiento**:

- `lib/pricing.ts`, `lib/fx.ts`, `lib/availability.ts`, `lib/whatsapp.ts`, `lib/data.ts`
- `components/public/booking-form.tsx` (lógica; sí se puede restylear UI)
- server actions de reserva

---

## Archivos clave a rediseñar

| Path | Rol |
|------|-----|
| `app/(public)/page.tsx` | Home — hoy Lucide icon soup + Cards shadcn; reescribir layout |
| `app/(public)/layout.tsx` / `app/layout.tsx` | fonts, metadata |
| `app/globals.css` | tokens; ajustar si hace falta sin romper admin |
| `components/public/site-header.tsx` | chrome mínimo, logo real |
| `components/public/gallery.tsx` | photography-first |
| `components/public/sticky-cta.tsx` | CTA conversión |
| `components/public/booking-form.tsx` | form `/reservar` visual |
| rutas `(public)/reservar/*`, offline si aplica | coherencia visual |
| `components/ui/*` | no reescribir shadcn entero; overrides locales OK |

---

## Anti-slop visual (claude-design — score antes de cerrar)

Auditar la home y marcar score 0–10 (10 = máximo slop). **No mergear si residual ≥ 4 en tells compositivos.**

Tells prohibidos:

1. Tech gradient blue/violet/indigo
2. Accent genérico indigo/violet (usar terracota/marrón brand)
3. Feature-tile grid 3× (icon + heading + sentence iguales)
4. Accent rail / left border cards decorativas
5. Glassmorphism / blur sin sistema de elevación
6. Monument stats inventados (“+500 huéspedes”, “4.9★” sin fuente real)
7. Icon topper Lucide centrado sobre cada H2
8. Center-stack todo centrado sin composición
9. Inter/system-ui por default “porque Tailwind”
10. Superficie incorrecta (hero SaaS en un listing)

Reparación:

- 3, 8, 10 → **re-layout**, no recolorear
- 1, 2, 9 → paleta + type
- 4, 5, 6, 7 → **sacar decoración**; jerarquía con escala/peso/espacio

### Anti-slop motion

- Sin Lottie genéricos, sin particles, sin parallax pesado
- Transiciones sutiles; respetar `prefers-reduced-motion`
- Hover de foto = zoom leve o sombra Airbnb-like, no bounce

### Anti-slop copy (humanizer)

Tono CM: **cercano, cálido, directo** — como recomendarle el depto a un amigo. ES rioplatense natural.

**Prohibido en UI copy:**

- “descubrir”, “experiencia única”, “oasis”, “refugio perfecto”, “sumergite”, “imperdible”, “viví lo auténtico”
- “nestled / vibrant / stunning / seamless / unlock / elevate” y traducciones
- tríos forzados (“comodidad, naturaleza y estilo”)
- em dash spam, bold mecánico, emojis en headings
- “Tu escapada soñada a las sierras” genérico sin detalle concreto

**Preferir:**

- concreto: “Vista a las sierras desde el balcón · San Martín e Yrigoyen · findes”
- una promesa corta + hechos (capacidad, noches, centro caminable)
- CTAs: “Reservar finde”, “Consultar por WhatsApp”, “Ver fotos”
- sin relleno: si una sección no aporta a reservar, **borrarla**

Posicionamiento brief: **Tu escapada de fin de semana a las sierras** — OK como línea guía, no como párrafo marketing.

No inventar amenities, reseñas, distancias ni precios. Si falta dato: leer Supabase property / seed `lib/seed-data.ts` / fotos reales.

---

## Qué hacer (pasos)

1. `git fetch origin && git checkout -B feat/public-visual-redesign-anti-slop origin/main` (o main local actualizado). Stash WIP ajeno (admin password branch) — **no mezclar**.
2. Leer: `page.tsx`, `site-header`, `gallery`, `sticky-cta`, `booking-form`, `globals.css`, `layout.tsx`, brand folder, 2–3 fotos reales.
3. Escribir en el PR body (o nota local) el **surface commitment** en 3 líneas + wireframe textual de secciones (sin código aún).
4. Implementar rediseño público:
   - Hero full-bleed con `depto-hero` / cover_photo
   - Tipografía editorial (serif headings + sans body legible)
   - Galería protagonista
   - Amenities sin icon-card grid
   - Precio promo canónico intacto en jerarquía visual
   - Sticky CTA + header limpios
   - `/reservar` misma familia visual (form aireado, calendario legible, resumen precio promo)
5. Mobile-first: hit targets ≥ 44–48px; sticky no tapa contenido crítico; safe-area.
6. Dark mode: si el sitio fuerza light hospitality, **no** inventar dark fancy; mantener light cálido.
7. Quitar SVGs default de `public/` si aparecen en UI (`next.svg`, `vercel.svg`, `globe.svg` no son brand).
8. Smoke local `pnpm dev` + browser:
   - home: sin “menor”; badge descuento; multi > 1 noche; fotos cargan
   - reservar: rango finde bookable; submit → WA (o demo path)
   - Lighthouse no es gate; visual sí
9. `pnpm typecheck` + `pnpm lint` scoped; `pnpm test` si hay tests de pricing/copy
10. Commit convencional + PR a main. **No mergear** salvo que la humana diga OK post-localhost.

---

## Criterios de aceptación

- [ ] Sigue siendo Next 15 + Supabase en el mismo repo (cero Django, cero CRA aparte)
- [ ] Home se siente **listing hospitality / revista**, no landing SaaS shadcn
- [ ] Slop self-audit escrito en el PR: score ≤ 3; tells 3/8/10 en 0
- [ ] Fotos reales dominan el scroll (no iconos)
- [ ] Copy sin clichés IA; tono amigo CM
- [ ] Precio: **Descuento por estadía prolongada** + multi grande + 1 noche tachada
- [ ] Capacidad **2 a 3 personas** sin “menor”
- [ ] Sticky CTA + header coherentes; tap ≥ 48px en móvil
- [ ] `/reservar` visual alineado; lógica booking intacta
- [ ] No regresiones iCal/admin/auth
- [ ] Browser smoke localhost documentado (qué se abrió, viewport móvil)
- [ ] PR con screenshots before/after (móvil + desktop)

---

## Fuera de scope

- Reescritura Django / FastAPI / SPA React pura
- Nuevo design system completo para admin
- Cambiar precios, noches, WA, dominio, copy de DB sin PATCH explícito
- SEO mega-rewrite, blog, multi-propiedad, mapa Mapbox fancy (un embed Google Maps sobrio OK si ya hay o es 10 líneas)
- Animaciones “wow” tipo Framer showcase
- Traducción EN
- Commit de `.env`, fotos dump sueltas, brand PDF

---

## Verify

```bash
cd "/home/marti/Documentos/Estudio Nomade/CM/Centro De Las Sierras/web-reservas"
export PATH="$HOME/.local/share/pnpm:$PATH"
pnpm typecheck
pnpm test
pnpm dev
# browser: http://localhost:3000 y /reservar — viewport ~390px y desktop
```

Build opcional si typecheck OK: `pnpm build` (puede >60s).

---

## Entrega

1. Branch `feat/public-visual-redesign-anti-slop`
2. 1–3 commits claros (`feat(public): …`) — no mezclar admin password WIP
3. PR a main: summary + **slop audit** + before/after + test plan
4. Reportar a la humana: URL localhost, qué cambió en 5 bullets, score slop
5. **No push con secretos. No `git add -A`.** No merge sin OK visual humano.

KISS: si el home se ve lindo y convierte, listo. No over-engineer design tokens file si globals.css alcanza.
