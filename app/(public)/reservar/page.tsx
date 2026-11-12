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
    <div className="mx-auto max-w-lg px-4 pb-16 pt-8 sm:px-6">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-terracota">
        Reserva
      </p>
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-marron sm:text-4xl">
        Reservá tu finde
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Findes: entrás viernes y te vas domingo (2 noches). Si hay puente, abrimos los días
        extra.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Capacidad: <span className="font-medium text-marron">2 a 3 personas</span>
      </p>

      <div className="mt-8">
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

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/" className="font-medium text-terracota hover:underline">
          ← Volver al depto
        </Link>
      </p>
    </div>
  );
}
