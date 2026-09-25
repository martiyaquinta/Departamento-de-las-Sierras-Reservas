-- Tarifas: 1 noche vs 2+ noches (montos publicados en ARS).
-- Defaults = USD 80 / USD 60 × blue venta 1560 (2026-09-25).
-- 80×1560 = 124800 · 60×1560 = 93600

alter table public.property
  add column if not exists price_one_night numeric(12,2);

update public.property set
  price_one_night = coalesce(price_one_night, 124800),
  price_per_night = 93600,
  weekend_pack_price = null,
  currency = 'ARS',
  min_nights = least(coalesce(min_nights, 1), 1),
  updated_at = now();

-- Si quedó min_nights > 1 de seeds viejos, bajar a 1 para permitir noche suelta
update public.property set min_nights = 1 where min_nights > 1;
