# PROMPT · ARS + finde vie→dom + availability hasta fin de año

Leé y ejecutá este brief completo. Español. KISS. Una rama, un PR.

## Repo

- Abs path: `/home/marti/Documentos/Estudio Nomade/CM/Centro De Las Sierras/web-reservas`
- Remote: `martiyaquinta/Centro-de-las-Sierras-Reservas`
- Base branch: `main` (actualizar primero). **No** trabajar encima de `fix/vercel-supabase-env` salvo merge previo a main.
- Nueva rama: `feat/ars-finde-vie-dom`
- Prod: `https://centrodelassierras.vercel.app`
- Local: `pnpm dev --port 3000` → `http://localhost:3000` (admin `/admin/login`)

## Pedido del humano (palabras de él)

1. Precio de la estadía **en pesos** (equivalente a **50 USD**, pero mostrado/cobrado en ARS).
2. En el **calendario del panel admin** (y en la lógica real de disponibilidad): poder **ingresar los viernes y salir los domingos** nada más.
3. **De ahora hasta fin de año** que haya fechas disponibles (seed/regeneración de `availability`).
4. Editar en la web el copy que dice que se alquila solo sáb y dom → que diga que **entra el viernes y sale el domingo**.

## Regla de negocio NUEVA (reemplaza la vieja)

| | Antes (código actual) | Ahora (objetivo) |
|---|---|---|
| Check-in | sábado | **viernes** |
| Check-out | lunes | **domingo** |
| Noches dormidas | sáb + dom | **vie + sáb** |
| Días `available` en DB | dow 6 y 0 (sáb, dom) | **dow 5 y 6 (vie, sáb)** |
| Día checkout clickeable | lunes (día después de noche libre) | **domingo** (mismo matcher `disabledDaysMatcher` con prev night available) |
| Pack finde | 2 noches sáb→lun | 2 noches **vie→dom** |
| Moneda | USD 50 / pack 100 | **ARS** equiv. ~50 USD/noche |

**Noches = check_in inclusive, check_out exclusive** (ya está en `lib/availability.ts`).  
Vie→dom = noches viernes + sábado. Domingo **no** es noche disponible; es solo checkout.

No inventar midweek ni “solo domingos”. Puentes extras siguen abriéndose a mano en admin.

## Precio ARS (referencia al armar el brief)

Cotización **dólar blue venta** al 2026-09-07 vía dolarapi: **1545 ARS/USD**.

- 50 USD/noche × 1545 ≈ **77.250 ARS/noche**
- Pack 2 noches ≈ **154.500 ARS**

**Decisión default si el humano no fija otro número:** redondear a enteros amigables:

- `price_per_night = 77500` (o `77000` si preferís redondo; documentá cuál elegiste en el PR)
- `weekend_pack_price = 155000` (2× o un pack redondo)
- `currency = 'ARS'`
- `cleaning_fee = 0` (sin cambio)

Si el humano después cambia el número en `/admin/precio`, la UI debe respetar DB; el seed/defaults tienen que arrancar en ARS correctos.

**No** hardcodear “USD” en WhatsApp, mails, formatters ni landing.

## Acceptance criteria

1. Landing, sticky CTA, `/reservar`, booking summary, WhatsApp payload y mail admin muestran montos en **ARS** (`$ …` es-AR), no `US$` ni “USD”.
2. `property.currency` seed + migration/update = `'ARS'`; `price_per_night` y `weekend_pack_price` en los montos ARS elegidos.
3. `formatARS` / `formatMoney` usan la currency real (ARS). Hoy `formatARS` **miente**: llama `formatMoney(amount, "USD")` en `lib/utils.ts` — hay que romper eso.
4. Pack finde aplica solo si check-in **viernes (5)** y check-out **domingo (0)** y exactamente **2** noches (`lib/pricing.ts` `isWeekendPackRange`).
5. Copy público:
   - Highlights / badges: no más “Sáb a dom” ni “check-in sábado · check-out lunes”.
   - Texto correcto: **entra viernes, sale domingo** (2 noches).
   - `house_rules` / seed: actualizar “Solo sábados, domingos…” → finde **vie–dom**.
   - Labels admin precio: pack finde **vie–dom** (el form ya dice vie–dom en label; alinear la lógica).
6. Disponibilidad default:
   - Seed demo (`buildDemoAvailability`) y SQL migration/seed: noches **viernes + sábado** = `available`; resto `blocked`.
   - Rango: **desde hoy (o current_date) hasta 2026-12-31 inclusive** (fin de año), no solo 12 semanas / 120 días.
7. Admin calendario: con el seed nuevo, los vie/sáb hasta fin de año se ven **verdes (libre)** sin tener que marcar a mano uno por uno. El admin **sigue** pudiendo toggle/range; no hace falta UI nueva de “solo viernes” si el seed + matcher bastan.
8. Booking público: se puede seleccionar rango vie→dom; matcher habilita domingo como checkout; `isRangeBookable` OK; total pack ARS.
9. `pnpm typecheck` + `pnpm lint` OK en archivos tocados. Smoke local en `localhost:3000`.
10. PR a `main` con resumen 3–5 líneas. Conventional commit. **No** commit `.env.local` / `.data/`.

## Archivos exactos a tocar (leé antes de editar)

### Precio / moneda
- `lib/utils.ts` — `formatMoney` default + **`formatARS` debe formatear ARS** (o deprecar y pasar `property.currency` desde callers).
- `lib/seed-data.ts` — `price_per_night`, `weekend_pack_price`, `currency`, `house_rules`.
- `lib/pricing.ts` — comentario + `isWeekendPackRange` (vie=5, dom=0).
- `lib/whatsapp.ts` — hoy hardcodea `USD ${...}` → usar currency ARS / `formatMoney`.
- `lib/notify.ts` — default currency.
- `lib/data.ts` — fallback `currency ?? "USD"` → `"ARS"`.
- `components/admin/precio-form.tsx` — ya dice ARS/vie–dom; verificar defaults al cargar.
- `components/public/sticky-cta.tsx`, `booking-form.tsx`, `app/(public)/page.tsx`, `app/(public)/reservar/page.tsx`.
- `supabase/migrations/0001_init.sql` **y/o** nueva migration `0002_ars_vie_dom_availability.sql` que:
  - `update property` set currency/precios/house_rules
  - re-seed availability vie+sáb hasta `2026-12-31`
  - **Cuidado:** no pisar noches ya `booked` por reservas reales; upsert solo donde no haya conflicto de negocio (preferí `on conflict` que no baje a blocked una noche con reserva activa, o documentá estrategia).

### Availability / calendario
- `lib/availability.ts` — mensajes de error (“entrás sábado…”) → vie/dom; matcher ya soporta checkout = día siguiente a noche available (domingo tras sáb) — verificar, no romper.
- `lib/seed-data.ts` `buildDemoAvailability` — dow **5 y 6**; horizonte hasta **2026-12-31** (no `weeks = 12` ciego si corta antes de fin de año).
- `components/admin/calendario-admin.tsx` — copy del label final (“Por defecto solo sáb+dom…”) → vie+sáb; checkout dom.
- `components/public/booking-form.tsx` — “Check-in el sábado · check-out el lunes” → viernes / domingo.
- `app/(public)/reservar/page.tsx` — intro finde.
- `app/(public)/page.tsx` — highlight `{ label: "Finde", sub: "Sáb a dom" }` → p.ej. `"Vie a dom"` / `"Entra vie · sale dom"`.
- `README.md` — tarifa seed y regla finde (una pasada, sin novelas).

### Opcional / scripts
- Si existe `scripts/setup_supabase.py` u otro seed runner, alinearlo.
- Demo store: si cachea property vieja en `.data/`, documentar borrar `.data/` o re-seed tras el cambio.

## Estrategia de datos (Supabase cloud del proyecto)

Ref skill: `cheioutcfptkxofojjva`. Hay `.env.local` (no lo printees ni lo commitees).

1. Preferí **nueva migration** aditiva `supabase/migrations/0002_....sql` en vez de reescribir historia de `0001` si prod ya corrió `0001`.
2. SQL sugerido (ajustar números ARS finales):

```sql
update public.property set
  price_per_night = 77500,
  weekend_pack_price = 155000,
  currency = 'ARS',
  house_rules = 'No se aceptan mascotas. No fumar dentro del depto. Sin fiestas. Finde: check-in viernes, check-out domingo (2 noches). Findes largos/puentes se abren a parte. Check-in desde las 15:00, check-out hasta las 11:00. Respetá a los vecinos.';

-- Availability: vie+sáb available hasta fin 2026; no borrar filas; upsert
do $$
declare
  d date := current_date;
  end_d date := '2026-12-31';
  dow int;
begin
  while d <= end_d loop
    dow := extract(dow from d); -- 0=dom ... 5=vie 6=sab
    insert into public.availability (night_date, status)
    values (
      d,
      case when dow in (5, 6) then 'available' else 'blocked' end
    )
    on conflict (night_date) do update
      set status = excluded.status,
          updated_at = now()
      -- opcional: where availability.status is distinct from '…' 
      ;
    d := d + 1;
  end loop;
end $$;
```

Si hay reservas confirmadas sobre noches que el loop marcaría blocked/available mal, **protegélas**: no flips de noches que aparezcan en `reservations` activas. Implementá esa guarda si detectás data real.

3. Correr migration con el flujo del repo (`python3 scripts/setup_supabase.py` o SQL editor). Reiniciar `next dev` si hace falta.
4. Modo demo sin Supabase: con solo cambiar `seed-data.ts` alcanza para localhost demo.

## Hipótesis / pitfalls conocidos

1. **`formatARS` → USD** es la trampa #1: la landing ya llama `formatARS` y el form admin dice “ARS”, pero el formatter sigue en dólares. Fix obligatorio.
2. **WhatsApp** hardcode `USD` en `lib/whatsapp.ts` — si no lo tocás, el handoff al huésped queda en verde.
3. **Pack range**: cambiar solo copy y dejar `isWeekendPackRange` en sáb→lun = el pack nunca aplica al nuevo finde.
4. **Availability sáb+dom vieja**: si solo cambiás copy, el calendario público sigue ofreciendo sáb→lun. Hay que re-seed **y** cambiar demo builder.
5. **Checkout matcher**: con vie+sáb available, domingo debe ser clickeable; lunes ya no. No special-casear dow a mano si el matcher genérico alcanza.
6. **`on conflict do nothing`** en seed viejo no actualiza sáb/dom → vie/sáb: usá `do update` o borrá rango futuro blocked mal seteado con criterio seguro.
7. **Horizonte 120 días / 12 weeks** no llega a fin de año desde septiembre → extender a `2026-12-31`.
8. No reintroducir login demo `000000` ni tocar allowlist admin.
9. No expandir a alquiler semanal completo.
10. Branch actual del workspace puede ser `fix/vercel-supabase-env` con `.gitignore` dirty — **branch from fresh main**, no mezclar ese fix salvo que ya esté mergeado.

## Verify

```bash
cd "/home/marti/Documentos/Estudio Nomade/CM/Centro De Las Sierras/web-reservas"
git checkout main && git pull
git checkout -b feat/ars-finde-vie-dom
# ... cambios ...
pnpm typecheck
pnpm lint
pnpm dev --port 3000
```

Smoke manual:
1. `http://localhost:3000` — precio en pesos; highlight “entra vie / sale dom”.
2. `/reservar` — calendario: vie y sáb seleccionables; checkout dom; total pack ARS.
3. Intentar sáb→lun: no debe armar pack viejo; si sáb no es check-in válido con solo vie+sáb available, el rango no cierra (OK).
4. `/admin/login` → calendario: verdes en vie/sáb hasta dic 2026.
5. `/admin/precio` — muestra ARS; guardar no revierte a USD.
6. Crear reserva de prueba (o dry-run WhatsApp URL) y mirar texto de moneda.

## PR

- Título: `feat: precios ARS y finde viernes–domingo`
- Body: regla vie→dom (noches vie+sáb); montos ARS elegidos + fuente cotización; migration/seed hasta 2026-12-31; formatter/WhatsApp sin USD hardcode.
- `gh pr create --base main`
- No `git add -A` ciego (evitar `.env.local`, `.data/`, `.next`).

## Anti-scope

- No rediseñar landing ni PWA.
- No multi-moneda runtime ni API de dólar en vivo (monto fijo ARS en DB).
- No cambiar WA number ni admin email allowlist.
- No borrar reservas existentes.
- No “arreglar” Vercel env en este PR.

## Done cuando

Checklist acceptance 1–10 en verde + PR abierto + smoke localhost pegado en el PR.
