import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PushEnable } from "@/components/admin/push-enable";
import { isSupabaseConfigured } from "@/lib/supabase/server";

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
      ? `${siteBase()}/api/calendar/export.ics?token=${encodeURIComponent(icalToken)}`
      : null;

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
          <CardTitle className="text-base">Calendario iCal (Booking / Airbnb)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Pegá este link en Booking → Calendario → Sincronizar calendarios → Importar
            calendario. Booking va a marcar ocupadas las fechas que ya están reservadas o
            bloqueadas acá.
          </p>
          {icalUrl ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">Link iCal (copiá completo)</p>
              <p className="break-all rounded-md border bg-background p-3 font-mono text-xs text-foreground">
                {icalUrl}
              </p>
              <p className="text-xs">
                Nombre sugerido: <strong className="text-foreground">Web De Las Sierras</strong>
              </p>
            </div>
          ) : (
            <p className="text-destructive text-xs">
              Falta <code className="font-mono">ICAL_EXPORT_TOKEN</code> en Vercel (mín. 16
              caracteres) + redeploy. Sin eso el export no funciona.
            </p>
          )}
          <p className="text-xs">
            Solo exporta ocupación (sin datos del huésped). La sync tarda un rato en Booking
            (no es al instante).
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
