import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PushEnable } from "@/components/admin/push-enable";
import { BookingSyncButton } from "@/components/admin/booking-sync-button";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getBookingIcalUrl } from "@/lib/booking-sync";

function siteBase(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://departamentodelassierras.vercel.app";
  return raw.replace(/\/$/, "");
}

export default function AdminAjustesPage() {
  const configured = isSupabaseConfigured();
  const icalToken = String(process.env.ICAL_EXPORT_TOKEN ?? "").trim();
  const icalUrl =
    icalToken.length >= 16
      ? `${siteBase()}/api/ical/${encodeURIComponent(icalToken)}.ics`
      : null;
  const bookingUrl = getBookingIcalUrl();

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Ajustes</h1>

      <Card className="bg-crema">
        <CardHeader>
          <CardTitle className="text-base">Notificaciones push</CardTitle>
        </CardHeader>
        <CardContent>
          <PushEnable />
        </CardContent>
      </Card>

      <Card className="bg-crema">
        <CardHeader>
          <CardTitle className="text-base">Web → Booking (export iCal)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Pegá este link en Booking → Calendario → Sincronizar → Importar calendario.
            Booking marca ocupado lo reservado/bloqueado acá (sin reenviar lo que vino de
            Booking).
          </p>
          {icalUrl ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">Link iCal (copiá completo)</p>
              <p className="break-all rounded-md border bg-background p-3 font-mono text-xs text-foreground">
                {icalUrl}
              </p>
              <p className="text-xs">
                Nombre: <strong className="text-foreground">Web De Las Sierras</strong>
              </p>
            </div>
          ) : (
            <p className="text-destructive text-xs">
              Falta <code className="font-mono">ICAL_EXPORT_TOKEN</code> en Vercel + redeploy.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-crema">
        <CardHeader>
          <CardTitle className="text-base">Booking → Web (import iCal)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            La web baja el calendario de Booking 1 vez al día (y podés forzar acá). Las fechas
            ocupadas en Booking se bloquean en el calendario de la web.
          </p>
          {bookingUrl ? (
            <>
              <p className="break-all rounded-md border bg-background p-3 font-mono text-[10px] text-foreground">
                {bookingUrl}
              </p>
              <BookingSyncButton />
            </>
          ) : (
            <p className="text-destructive text-xs">
              Falta <code className="font-mono">BOOKING_ICAL_URL</code> en Vercel (el link
              ical.booking.com/v1/export?t=…) + redeploy.
            </p>
          )}
          <p className="text-xs">
            Si Booking no tiene reservas, el feed viene vacío y no hay nada que bloquear.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-crema">
        <CardHeader>
          <CardTitle className="text-base">Cuenta admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Para cambiar la contraseña usá{" "}
            <strong>Supabase Dashboard → Authentication → Users</strong> o el link de recovery
            por email.
          </p>
          <p>
            Estado Supabase:{" "}
            <span className={configured ? "text-sage font-medium" : "text-destructive font-medium"}>
              {configured ? "configurado" : "modo demo (sin env)"}
            </span>
          </p>
          <p className="text-xs">
            v1 no incluye pagos online (Mercado Pago). Las reservas son solicitudes pending →
            confirm/reject.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
