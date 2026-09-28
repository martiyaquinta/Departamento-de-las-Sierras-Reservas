import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  BOOKING_ICAL_NOTE,
  busyNightsFromEvents,
  defaultStatusForNight,
  parseIcsBusyEvents,
} from "@/lib/ical";

export type BookingSyncResult = {
  ok: true;
  source: string;
  events: number;
  nightsBusy: number;
  blocked: number;
  released: number;
  fetchedAt: string;
};

export type BookingSyncError = {
  ok: false;
  error: string;
};

export function getBookingIcalUrl(): string {
  return String(process.env.BOOKING_ICAL_URL ?? "").trim();
}

export async function fetchIcsText(url: string): Promise<string> {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "text/calendar, text/plain, */*",
      "User-Agent": "DepartamentoDeLasSierras-CalendarSync/1.0",
    },
    cache: "no-store",
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`No se pudo bajar iCal de Booking (HTTP ${res.status})`);
  }
  const text = await res.text();
  if (!/BEGIN:VCALENDAR/i.test(text)) {
    throw new Error("La respuesta no parece un calendario iCal");
  }
  return text;
}

/**
 * Pull Booking export ICS → mark those nights blocked with note=booking-ical.
 * Nights previously marked booking-ical that left the feed are restored
 * to the default finde rule (vie/sáb available, resto blocked).
 * Manual blocks (other notes) and local reservations are untouched.
 */
export async function syncBookingIcal(
  url = getBookingIcalUrl()
): Promise<BookingSyncResult | BookingSyncError> {
  if (!url) {
    return {
      ok: false,
      error: "Falta BOOKING_ICAL_URL (link iCal export de Booking)",
    };
  }
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  let ics: string;
  try {
    ics = await fetchIcsText(url);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Fetch falló" };
  }

  const events = parseIcsBusyEvents(ics);
  const busy = new Set(busyNightsFromEvents(events));
  const fetchedAt = new Date().toISOString();

  const supabase = createServiceClient();

  // Existing booking-ical rows (to release ones no longer busy)
  const { data: existingRows, error: exErr } = await supabase
    .from("availability")
    .select("night_date, status, note")
    .eq("note", BOOKING_ICAL_NOTE);

  if (exErr) return { ok: false, error: exErr.message };

  const existing = new Set((existingRows ?? []).map((r) => String(r.night_date)));

  const toBlock = [...busy];
  const toRelease = [...existing].filter((d) => !busy.has(d));

  // Upsert busy nights as blocked from Booking
  if (toBlock.length > 0) {
    const rows = toBlock.map((night_date) => ({
      night_date,
      status: "blocked" as const,
      note: BOOKING_ICAL_NOTE,
      updated_at: fetchedAt,
    }));
    // chunk to avoid payload limits
    for (let i = 0; i < rows.length; i += 200) {
      const slice = rows.slice(i, i + 200);
      const { error } = await supabase.from("availability").upsert(slice, {
        onConflict: "night_date",
      });
      if (error) return { ok: false, error: error.message };
    }
  }

  // Release nights that left Booking feed
  if (toRelease.length > 0) {
    const rows = toRelease.map((night_date) => ({
      night_date,
      status: defaultStatusForNight(night_date),
      note: null as string | null,
      updated_at: fetchedAt,
    }));
    for (let i = 0; i < rows.length; i += 200) {
      const slice = rows.slice(i, i + 200);
      const { error } = await supabase.from("availability").upsert(slice, {
        onConflict: "night_date",
      });
      if (error) return { ok: false, error: error.message };
    }
  }

  return {
    ok: true,
    source: url,
    events: events.length,
    nightsBusy: busy.size,
    blocked: toBlock.length,
    released: toRelease.length,
    fetchedAt,
  };
}
