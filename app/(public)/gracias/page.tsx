import type { Metadata } from "next";
import Link from "next/link";
import { getProperty } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatARS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Solicitud enviada",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GraciasPage({ searchParams }: Props) {
  const sp = await searchParams;
  const code = String(sp.code ?? "");
  const name = String(sp.name ?? "huésped");
  const checkIn = String(sp.in ?? "");
  const checkOut = String(sp.out ?? "");
  const guests = Number(sp.guests ?? 1);
  const total = Number(sp.total ?? 0);
  const autoWa = String(sp.wa ?? "") === "1";

  const property = await getProperty();
  const wa =
    code && checkIn && checkOut
      ? buildWhatsAppUrl({
          phoneE164: property.whatsapp_e164,
          guestName: name,
          checkIn,
          checkOut,
          guests,
          publicCode: code,
          totalAmount: total || undefined,
        })
      : null;

  return (
    <div className="mx-auto flex max-w-lg flex-col px-4 py-14 sm:px-6">
      {wa && autoWa && (
        <script
          dangerouslySetInnerHTML={{
            __html: `window.location.replace(${JSON.stringify(wa)});`,
          }}
        />
      )}

      <p className="text-xs font-medium uppercase tracking-[0.16em] text-terracota">
        Solicitud recibida
      </p>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-marron">
        Listo, {name.split(" ")[0]}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        Recibimos tu solicitud. Te redirigimos a WhatsApp con los datos de la reserva para
        confirmar.
      </p>

      {code && (
        <div className="mt-8 rounded-sm border border-marron/12 bg-crema p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Código de seguimiento
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-marron">{code}</p>
          {total > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Total estimado: {formatARS(total)}
            </p>
          )}
        </div>
      )}

      <div className="mt-8 flex w-full flex-col gap-3">
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white"
          >
            Abrir WhatsApp con la reserva
          </a>
        )}
        {code && (
          <Link
            href={`/reserva/${code}`}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-marron/20 bg-crema px-6 py-3.5 text-sm font-semibold text-marron"
          >
            Ver estado de la reserva
          </Link>
        )}
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center text-sm font-medium text-terracota hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
