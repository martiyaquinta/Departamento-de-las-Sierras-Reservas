"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createReservationAction } from "@/lib/actions/reservations";
import { calculateTotal } from "@/lib/pricing";
import { disabledDaysMatcher } from "@/lib/availability";
import { formatARS } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Availability } from "@/lib/types";

type Props = {
  availability: Availability[];
  bookedNights: string[];
  /** ARS · 2+ noches */
  pricePerNight: number;
  /** ARS · 1 noche */
  priceOneNight: number | null;
  weekendPackPrice: number | null;
  cleaningFee: number;
  capacity: number;
  minNights: number;
  whatsappE164?: string | null;
};

export function BookingForm({
  availability,
  bookedNights,
  pricePerNight,
  priceOneNight,
  weekendPackPrice,
  cleaningFee,
  capacity,
  minNights,
  whatsappE164 = null,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(2);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [message, setMessage] = useState("");

  const bookedSet = useMemo(() => new Set(bookedNights), [bookedNights]);
  const disabled = useMemo(
    () => disabledDaysMatcher(availability, bookedSet),
    [availability, bookedSet]
  );

  const oneNightArs =
    priceOneNight != null && priceOneNight > 0 ? priceOneNight : pricePerNight;

  const checkIn = range?.from ? format(range.from, "yyyy-MM-dd") : "";
  const checkOut = range?.to ? format(range.to, "yyyy-MM-dd") : "";

  const pricing =
    checkIn && checkOut
      ? calculateTotal({
          checkIn,
          checkOut,
          pricePerNight,
          priceOneNight: oneNightArs,
          weekendPackPrice,
          cleaningFee,
        })
      : null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      toast.error("Elegí check-in y check-out");
      return;
    }
    startTransition(async () => {
      const res = await createReservationAction({
        checkIn,
        checkOut,
        guests,
        guestName,
        guestEmail,
        guestPhone,
        message,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      const code = res.data!.publicCode;
      const total = pricing?.total ?? 0;
      const wa = buildWhatsAppUrl({
        phoneE164: whatsappE164,
        guestName,
        checkIn,
        checkOut,
        guests,
        publicCode: code,
        totalAmount: total || undefined,
        currency: "ARS",
        guestPhone,
        message,
      });

      toast.success("Solicitud lista — te llevamos a WhatsApp");

      const gracias = `/gracias?code=${encodeURIComponent(code)}&name=${encodeURIComponent(guestName)}&in=${checkIn}&out=${checkOut}&guests=${guests}&total=${total}&wa=1`;

      if (wa) {
        window.location.href = wa;
        return;
      }

      router.push(gracias);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 pb-8">
      <section className="rounded-sm border border-marron/12 bg-crema p-5 sm:p-6">
        <h2 className="font-serif text-xl font-semibold text-marron">Elegí tus noches</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Solo findes (y puentes que abramos). Check-in el viernes · check-out el domingo.
          Las fechas tachadas no se pueden elegir.
        </p>
        <div className="mt-5">
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={1}
            disabled={disabled}
            defaultMonth={new Date()}
            className="mx-auto rounded-sm border border-marron/10 bg-background"
          />
          {checkIn && checkOut && (
            <p className="mt-4 text-center text-sm font-medium text-marron">
              {format(range!.from!, "d MMM", { locale: es })} →{" "}
              {format(range!.to!, "d MMM yyyy", { locale: es })}
              {pricing ? ` · ${pricing.nights} noche${pricing.nights === 1 ? "" : "s"}` : ""}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-sm border border-marron/12 bg-crema p-5 sm:p-6">
        <h2 className="font-serif text-xl font-semibold text-marron">Tus datos</h2>
        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guests">Huéspedes (máx. {capacity})</Label>
            <Input
              id="guests"
              type="number"
              min={1}
              max={capacity}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="min-h-12 bg-background"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Tu nombre"
              className="min-h-12 bg-background"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono / WhatsApp</Label>
            <Input
              id="phone"
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="+54 9 11 ..."
              className="min-h-12 bg-background"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="tu@email.com"
              className="min-h-12 bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mensaje (opcional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Horario de llegada, consultas..."
              className="min-h-24 bg-background"
            />
          </div>
        </div>
      </section>

      <section className="rounded-sm border border-marron/15 bg-crema p-5 sm:p-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-terracota">
          Descuento por estadía prolongada
        </p>
        <div className="mt-4 space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">2 o más noches</span>
            <span className="font-semibold text-marron">
              {formatARS(pricePerNight)} / noche
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">1 noche (sin descuento)</span>
            <span
              className={
                oneNightArs > pricePerNight
                  ? "text-muted-foreground line-through decoration-marron/40"
                  : "font-medium text-marron"
              }
            >
              {formatARS(oneNightArs)}
            </span>
          </div>
          {minNights > 1 && (
            <p className="text-xs text-muted-foreground">Mínimo {minNights} noches</p>
          )}
          {pricing && pricing.nights > 0 && (
            <>
              <div className="flex items-center justify-between pt-2">
                <span>
                  {pricing.nights} noche{pricing.nights === 1 ? "" : "s"}
                  {pricing.nights === 1
                    ? ""
                    : ` × ${formatARS(pricing.unitPrice)}`}
                </span>
                <span className="font-semibold">
                  {formatARS(pricing.total - cleaningFee)}
                </span>
              </div>
              {cleaningFee > 0 && (
                <div className="flex items-center justify-between">
                  <span>Limpieza</span>
                  <span>{formatARS(cleaningFee)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-marron/10 pt-3 text-base font-bold">
                <span>Total estimado</span>
                <span className="text-marron">{formatARS(pricing.total)}</span>
              </div>
            </>
          )}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Es una solicitud. El dueño confirma y te escribe. No hay cobro online en esta
          versión. Montos en pesos.
        </p>
        <Button
          type="submit"
          size="lg"
          className="mt-5 min-h-12 w-full rounded-full bg-marron text-crema hover:bg-marron/90"
          disabled={pending}
        >
          {pending ? "Enviando..." : "Reservar y abrir WhatsApp"}
        </Button>
      </section>
    </form>
  );
}
