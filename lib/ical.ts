import { addDays, format, parseISO } from "date-fns";
import type { Availability, Reservation } from "@/lib/types";
import { buildBookedNightSet, nightsInRange } from "@/lib/availability";

export type IcalBusyEvent = {
  uid: string;
  summary: string;
  description?: string;
  /** YYYY-MM-DD inclusive (check-in / first busy night) */
  start: string;
  /** YYYY-MM-DD exclusive (check-out / day after last busy night) */
  end: string;
  stamp?: string;
};

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\n|\r/g, "\\n");
}

function foldLine(line: string): string {
  // RFC 5545: lines should be ≤ 75 octets; fold with CRLF + space
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let remaining = line;
  parts.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length > 0) {
    parts.push(" " + remaining.slice(0, 74));
    remaining = remaining.slice(74);
  }
  return parts.join("\r\n");
}

function formatUtcStamp(d = new Date()): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${day}T${h}${min}${s}Z`;
}

function toIcalDate(yyyyMmDd: string): string {
  return yyyyMmDd.replace(/-/g, "");
}

/** Merge sorted unique night keys into [start, endExclusive) ranges */
export function mergeNightKeysToRanges(nights: string[]): { start: string; end: string }[] {
  const sorted = [...new Set(nights)].sort();
  if (sorted.length === 0) return [];

  const ranges: { start: string; end: string }[] = [];
  let start = sorted[0]!;
  let prev = sorted[0]!;

  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i]!;
    const expectedNext = format(addDays(parseISO(prev), 1), "yyyy-MM-dd");
    if (cur === expectedNext) {
      prev = cur;
      continue;
    }
    ranges.push({
      start,
      end: format(addDays(parseISO(prev), 1), "yyyy-MM-dd"),
    });
    start = cur;
    prev = cur;
  }
  ranges.push({
    start,
    end: format(addDays(parseISO(prev), 1), "yyyy-MM-dd"),
  });
  return ranges;
}

/**
 * Busy periods for external channels (Booking/Airbnb):
 * - reservas confirmed + pending con hold vigente
 * - noches blocked en availability (cierres manuales / offline)
 */
export function buildBusyEvents(params: {
  reservations: Pick<
    Reservation,
    "id" | "public_code" | "check_in" | "check_out" | "status" | "hold_until" | "updated_at"
  >[];
  availability: Availability[];
  propertyName?: string;
}): IcalBusyEvent[] {
  const { reservations, availability, propertyName = "Departamento de las Sierras" } = params;
  const now = new Date();
  const events: IcalBusyEvent[] = [];

  for (const r of reservations) {
    const active =
      r.status === "confirmed" ||
      (r.status === "pending" &&
        r.hold_until != null &&
        new Date(r.hold_until) > now);
    if (!active) continue;
    if (!r.check_in || !r.check_out || r.check_out <= r.check_in) continue;

    events.push({
      uid: `res-${r.id}@departamentodelassierras`,
      summary: `Reservado — ${propertyName}`,
      description: `Reserva ${r.public_code} (${r.status})`,
      start: r.check_in,
      end: r.check_out,
      stamp: r.updated_at,
    });
  }

  const booked = buildBookedNightSet(reservations);
  const blockedNights: string[] = [];
  for (const a of availability) {
    if (a.status !== "blocked") continue;
    if (booked.has(a.night_date)) continue; // already covered by reservation event
    blockedNights.push(a.night_date);
  }

  for (const range of mergeNightKeysToRanges(blockedNights)) {
    events.push({
      uid: `block-${range.start}-${range.end}@departamentodelassierras`,
      summary: `No disponible — ${propertyName}`,
      description: "Bloqueo manual / fuera de temporada",
      start: range.start,
      end: range.end,
    });
  }

  return events.sort((a, b) => a.start.localeCompare(b.start));
}

export function renderIcsCalendar(params: {
  calName: string;
  events: IcalBusyEvent[];
  prodId?: string;
}): string {
  const {
    calName,
    events,
    prodId = "-//Departamento de las Sierras//Reservas//ES",
  } = params;
  const stamp = formatUtcStamp();
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${prodId}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calName)}`,
    "X-WR-TIMEZONE:America/Argentina/Buenos_Aires",
  ];

  for (const ev of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${ev.uid}`);
    lines.push(`DTSTAMP:${ev.stamp ? formatUtcStamp(new Date(ev.stamp)) : stamp}`);
    lines.push(`DTSTART;VALUE=DATE:${toIcalDate(ev.start)}`);
    lines.push(`DTEND;VALUE=DATE:${toIcalDate(ev.end)}`);
    lines.push(`SUMMARY:${escapeText(ev.summary)}`);
    if (ev.description) {
      lines.push(`DESCRIPTION:${escapeText(ev.description)}`);
    }
    lines.push("TRANSP:OPAQUE");
    lines.push("STATUS:CONFIRMED");
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

/** Nights covered by a busy event (for tests / debug) */
export function eventNights(ev: IcalBusyEvent): string[] {
  return nightsInRange(ev.start, ev.end);
}
