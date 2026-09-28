import { NextRequest } from "next/server";
import {
  handleIcalExport,
  icalOptionsResponse,
} from "@/lib/ical-export";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Legacy query form: /api/calendar/export.ics?token=… */
export async function GET(request: NextRequest) {
  const token =
    request.nextUrl.searchParams.get("token")?.trim() ||
    request.headers.get("x-ical-token")?.trim() ||
    "";
  return handleIcalExport(token);
}

export async function HEAD(request: NextRequest) {
  const token =
    request.nextUrl.searchParams.get("token")?.trim() ||
    request.headers.get("x-ical-token")?.trim() ||
    "";
  const res = await handleIcalExport(token);
  return new Response(null, { status: res.status, headers: res.headers });
}

export async function OPTIONS() {
  return icalOptionsResponse();
}
