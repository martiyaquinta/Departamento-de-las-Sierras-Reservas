/** POIs a media cuadra del depto (San Martín 454). Distancias = relato de la dueña. */

export type NearbyPoi = {
  name: string;
  walking: string;
  blurb?: string;
};

/** A pasos / enfrente — escala de cuadra */
export const NEARBY_BLOCK_POIS: NearbyPoi[] = [
  { name: "Renzo", walking: "Enfrente" },
  { name: "El Monarca", walking: "Media cuadra" },
  { name: "Figlio", walking: "Media cuadra" },
  { name: "Mi Granito de Café", walking: "Media cuadra", blurb: "Café" },
  { name: "Kiosko 24hs", walking: "Esquina Chacabuco", blurb: "Conveniencia" },
];

/**
 * Paseos a pie desde San Martín 454 (tiempos a ~5 km/h).
 * Anclas: Av. Dr. Osvaldo Zarini (dique), Parque Independencia / Fragata Sarmiento,
 * Av. Monseñor de Andrea 332–398 (Calvario).
 */
export const NEARBY_WALKS: NearbyPoi[] = [
  { name: "Dique del Fuerte", walking: "~30 min a pie" },
  { name: "Parque Independencia", walking: "~25 min a pie" },
  { name: "Calvario", walking: "~15 min a pie" },
];

export const PROPERTY_ADDRESS_SHORT = "San Martín 454, Tandil";
export const PROPERTY_ADDRESS_FULL =
  "San Martín 454, B7000 Tandil, Provincia de Buenos Aires";

export const PROPERTY_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=San+Mart%C3%ADn+454,+B7000+Tandil,+Provincia+de+Buenos+Aires";

/** Mapa de barrio con depto + POIs (OSM + pines) */
export const NEARBY_MAP_PATH = "/maps/cerca-depto.jpg";
