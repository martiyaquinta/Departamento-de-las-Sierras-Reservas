import { NextResponse } from "next/server";
import {
  createServiceClient,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { buildBusyEvents, renderIcsCalendar } from "@/lib/ical";
import type { Availability, Reservation } from "@/lib/types";
import {
  getActiveReservationsForBooking,
  getAvailability,
  getProperty,
} from "@/lib/data";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

export function getExpectedIcalToken(): string {
  return String(process.env.ICAL_EXPORT_TOKEN ?? "").trim();
}

export function isValidIcalToken(token: string): boolean {
  const expected = getExpectedIcalToken();
  if (!expected || expected.length < 16) return false;
  const t = token.trim().replace(/\.ics$/i, "");
  if (!t) return false;
  return timingSafeEqual(t, expected);
}

export function unauthorizedIcal(): NextResponse {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export function missingTokenConfig(): NextResponse {
  return new NextResponse("ICAL_EXPORT_TOKEN not configured", {
    status: 503,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

function icsResponse(body: string): NextResponse {
  // Booking is picky: classic calendar content-type, attachment, no charset quirks
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="export.ics"',
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    },
  });
}

async function loadLiveData(): Promise<{
  propertyName: string;
  reservations: Pick<
    Reservation,
    "id" | "public_code" | "check_in" | "check_out" | "status" | "hold_until" | "updated_at"
  >[];
  availability: Availability[];
}> {
  let client;
  try {
    client = createServiceClient();
  } catch {
    const url = getSupabaseUrl();
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !anon) throw new Error("Supabase no configurado");
    client = createSupabaseClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  const horizonStart = new Date();
  horizonStart.setUTCDate(horizonStart.getUTCDate() - 7);
  const startStr = horizonStart.toISOString().slice(0, 10);

  const horizonEnd = new Date();
  horizonEnd.setUTCFullYear(horizonEnd.getUTCFullYear() + 2);
  const endStr = horizonEnd.toISOString().slice(0, 10);

  const [propRes, resRes, availRes] = await Promise.all([
    client.from("property").select("name").limit(1).maybeSingle(),
    client
      .from("reservations")
      .select("id, public_code, check_in, check_out, status, hold_until, updated_at")
      .in("status", ["pending", "confirmed"])
      .gte("check_out", startStr)
      .order("check_in", { ascending: true }),
    client
      .from("availability")
      .select("night_date, status, note, updated_at")
      .gte("night_date", startStr)
      .lte("night_date", endStr)
      .order("night_date", { ascending: true }),
  ]);

  return {
    propertyName: String(propRes.data?.name ?? "Departamento de las Sierras"),
    reservations: (resRes.data ?? []) as Pick<
      Reservation,
      "id" | "public_code" | "check_in" | "check_out" | "status" | "hold_until" | "updated_at"
    >[],
    availability: (availRes.data ?? []) as Availability[],
  };
}

/** Shared ICS body builder used by path + query export routes. */
export async function buildExportIcsBody(): Promise<string> {
  let propertyName = "Departamento de las Sierras";
  let reservations: Pick<
    Reservation,
    "id" | "public_code" | "check_in" | "check_out" | "status" | "hold_until" | "updated_at"
  >[] = [];
  let availability: Availability[] = [];

  if (isSupabaseConfigured()) {
    const live = await loadLiveData();
    propertyName = live.propertyName;
    reservations = live.reservations;
    availability = live.availability;
  } else {
    const [property, active, avail] = await Promise.all([
      getProperty(),
      getActiveReservationsForBooking(),
      getAvailability(),
    ]);
    propertyName = property.name;
    reservations = active.map((r, i) => ({
      id: `demo-${i}`,
      public_code: `DEMO-${i}`,
      check_in: r.check_in,
      check_out: r.check_out,
      status: r.status,
      hold_until: r.hold_until,
      updated_at: new Date().toISOString(),
    }));
    availability = avail;
  }

  const events = buildBusyEvents({
    reservations,
    availability,
    propertyName,
  });

  // Drop fully-past events (Booking often rejects noisy historic feeds)
  const today = new Date().toISOString().slice(0, 10);
  const future = events.filter((e) => e.end > today);

  return renderIcsCalendar({
    calName: "De Las Sierras busy",
    events: future,
  });
}

export async function handleIcalExport(token: string | null | undefined): Promise<NextResponse> {
  const expected = getExpectedIcalToken();
  if (!expected || expected.length < 16) return missingTokenConfig();
  if (!token || !isValidIcalToken(token)) return unauthorizedIcal();

  try {
    const body = await buildExportIcsBody();
    return icsResponse(body);
  } catch (e) {
    console.error("[ical export]", e);
    return new NextResponse("Error generating calendar", {
      status: 500,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

export function icalOptionsResponse(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Ical-Token",
      "Access-Control-Max-Age": "86400",
    },
  });
}
