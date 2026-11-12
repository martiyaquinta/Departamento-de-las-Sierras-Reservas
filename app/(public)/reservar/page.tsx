import type { Metadata } from "next";
import Link from "next/link";
import { BookingForm } from "@/components/public/booking-form";
import {
  getActiveReservationsForBooking,
  getAvailability,
  getProperty,
} from "@/lib/data";
import { buildBookedNightSet } from "@/lib/availability";

export const metadata: Metadata = {
  title: "Reservar",
  description: "Elegí fechas del finde y enviá tu solicitud de reserva",
};

export default async function ReservarPage() {
  const [property, availability, active] = await Promise.all([
    getProperty(),
    getAvailability(),
    getActiveReservationsForBooking(),
  ]);
  const booked = buildBookedNightSet(active);

  return (
    <div className="mx-auto max-w-lg px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:pb-16 sm:pt-8">
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-terracota sm:mb-2 sm:text-xs">
        Reserva
      </p>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-4xl">
        Reservá tu finde
      </h1>
      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:mt-3">
        Findes: entrás viernes y te vas domingo (2 noches). Si hay puente, abrimos los días
        extra.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Capacidad: <span className="font-medium text-ink">2 a 3 personas</span>
      </p>

      <div className="mt-6 sm:mt-8">
        <BookingForm
          availability={availability}
          bookedNights={[...booked]}
          pricePerNight={property.price_per_night}
          priceOneNight={property.price_one_night}
          weekendPackPrice={property.weekend_pack_price}
          cleaningFee={property.cleaning_fee}
          capacity={property.capacity}
          minNights={property.min_nights}
          whatsappE164={property.whatsapp_e164}
        />
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground sm:mt-8">
        <Link href="/" className="font-medium text-terracota hover:underline">
          ← Volver al depto
        </Link>
      </p>
    </div>
  );
}
