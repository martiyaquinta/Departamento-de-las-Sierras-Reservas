import { differenceInCalendarDays, parseISO } from "date-fns";

export function nightsBetween(checkIn: string, checkOut: string): number {
  return differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn));
}

/** Pack finde desactivado — siempre false (compat). */
export function isWeekendPackRange(checkIn: string, checkOut: string): boolean {
  void checkIn;
  void checkOut;
  return false;
}

/**
 * Tarifas:
 * - 1 noche → priceOneNight (ARS)
 * - 2+ noches → nights × pricePerNight (ARS)
 */
export function calculateTotal(params: {
  checkIn: string;
  checkOut: string;
  pricePerNight: number;
  priceOneNight?: number | null;
  weekendPackPrice?: number | null;
  cleaningFee?: number;
}): { nights: number; total: number; usedWeekendPack: boolean; unitPrice: number } {
  const nights = nightsBetween(params.checkIn, params.checkOut);
  if (nights <= 0) {
    return { nights: 0, total: 0, usedWeekendPack: false, unitPrice: 0 };
  }

  const cleaning = params.cleaningFee ?? 0;
  void params.weekendPackPrice;

  const oneNight =
    params.priceOneNight != null && params.priceOneNight > 0
      ? params.priceOneNight
      : params.pricePerNight;

  if (nights === 1) {
    return {
      nights,
      total: oneNight + cleaning,
      usedWeekendPack: false,
      unitPrice: oneNight,
    };
  }

  return {
    nights,
    total: nights * params.pricePerNight + cleaning,
    usedWeekendPack: false,
    unitPrice: params.pricePerNight,
  };
}
