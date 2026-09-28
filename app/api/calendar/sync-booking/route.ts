import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { syncBookingIcal, getBookingIcalUrl } from "@/lib/booking-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

function authorized(request: NextRequest): boolean {
  const secrets = [
    process.env.CRON_SECRET,
    process.env.ICAL_EXPORT_TOKEN,
  ]
    .map((s) => String(s ?? "").trim())
    .filter((s) => s.length >= 16);

  if (secrets.length === 0) return false;

  const auth = request.headers.get("authorization")?.trim() ?? "";
  const bearer = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";
  const headerTok = request.headers.get("x-ical-token")?.trim() ?? "";
  const q =
    request.nextUrl.searchParams.get("token")?.trim() ||
    request.nextUrl.searchParams.get("secret")?.trim() ||
    "";

  const candidates = [bearer, headerTok, q].filter(Boolean);
  for (const c of candidates) {
    for (const s of secrets) {
      if (timingSafeEqual(c, s)) return true;
    }
  }
  return false;
}

async function run() {
  const result = await syncBookingIcal(getBookingIcalUrl());
  if (result.ok) {
    revalidatePath("/reservar");
    revalidatePath("/admin/calendario");
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/api/calendar/export.ics");
  }
  return result;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const result = await run();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
