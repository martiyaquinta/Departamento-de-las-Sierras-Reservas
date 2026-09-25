/**
 * Cotización fija para publicar tarifas en pesos.
 * Fuente: dólar blue venta (dolarapi) 2026-09-25 = 1560.
 * El admin edita en USD; la web y los totales se guardan/muestran en ARS.
 */
export const USD_ARS_RATE = 1560;

/** Defaults de negocio (USD). */
export const DEFAULT_PRICE_ONE_NIGHT_USD = 80;
export const DEFAULT_PRICE_MULTI_NIGHT_USD = 60;

export function usdToArs(usd: number, rate = USD_ARS_RATE): number {
  if (!Number.isFinite(usd) || usd < 0) return 0;
  return Math.round(usd * rate);
}

export function arsToUsd(ars: number, rate = USD_ARS_RATE): number {
  if (!Number.isFinite(ars) || ars <= 0 || rate <= 0) return 0;
  // 2 decimales para el form admin
  return Math.round((ars / rate) * 100) / 100;
}
