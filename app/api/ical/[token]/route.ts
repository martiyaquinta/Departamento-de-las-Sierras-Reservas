import { NextRequest } from "next/server";
import {
  handleIcalExport,
  icalOptionsResponse,
} from "@/lib/ical-export";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Ctx = { params: Promise<{ token: string }> };

/**
 * Booking-friendly export URL (no query string):
 *   https://…/api/ical/<TOKEN>.ics
 *   https://…/api/ical/<TOKEN>
 */
export async function GET(_request: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params;
  return handleIcalExport(token);
}

export async function HEAD(_request: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params;
  const res = await handleIcalExport(token);
  // HEAD: same headers, empty body
  return new Response(null, { status: res.status, headers: res.headers });
}

export async function OPTIONS() {
  return icalOptionsResponse();
}
