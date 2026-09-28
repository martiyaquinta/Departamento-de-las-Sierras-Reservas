import { NextRequest, NextResponse } from "next/server";
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

export const dynamic = "force-dynamic";
export const revalidate = 0;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

function unauthorized(): NextResponse {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

function icsResponse(body: string): NextResponse {
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="departamento-de-las-sierras.ics"',
      // Booking/Airbnb poll every few hours; allow short CDN cache but revalidate
      "Cache-Control": "public, max-age=300, s-maxage=300",
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
  // Prefer service role so we always see reservations (RLS blocks anon).
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
  horizonStart.setUTCDate(horizonStart.getUTCDate() - 30);
  const startStr = horizonStart.toISOString().slice(0, 10);

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

export async function GET(request: NextRequest) {
  const expected = String(process.env.ICAL_EXPORT_TOKEN ?? "").trim();
  if (!expected || expected.length < 16) {
    return new NextResponse(
      "ICAL_EXPORT_TOKEN no configurado (mín. 16 caracteres)",
      {
        status: 503,
        headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
      }
    );
  }

  const token =
    request.nextUrl.searchParams.get("token")?.trim() ||
    request.headers.get("x-ical-token")?.trim() ||
    "";

  if (!token || !timingSafeEqual(token, expected)) {
    return unauthorized();
  }

  try {
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

    const body = renderIcsCalendar({
      calName: `${propertyName} (ocupado)`,
      events,
    });

    return icsResponse(body);
  } catch (e) {
    console.error("[ical export]", e);
    return new NextResponse("Error generando calendario", {
      status: 500,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
