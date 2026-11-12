import Link from "next/link";
import { formatARS } from "@/lib/utils";

export function StickyCta({
  priceFrom,
  priceOneNight,
}: {
  /** ARS · tarifa promo 2+ / noche */
  priceFrom: number;
  /** ARS · 1 noche (referencia); opcional */
  priceOneNight?: number | null;
}) {
  const showPromo =
    priceOneNight != null && priceOneNight > 0 && priceOneNight > priceFrom;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/98 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-terracota">
            Descuento estadía
          </p>
          <p className="truncate font-semibold text-ink">
            {formatARS(priceFrom)}
            <span className="text-xs font-normal text-muted-foreground">
              {" "}
              / noche · 2+
            </span>
          </p>
          {showPromo && (
            <p className="truncate text-xs text-muted-foreground">
              <span className="line-through decoration-ink/40">
                {formatARS(priceOneNight)}
              </span>
              <span className="ml-1">· 1 noche</span>
            </p>
          )}
        </div>
        <Link
          href="/reservar"
          className="inline-flex min-h-12 shrink-0 items-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-sm"
        >
          Reservar
        </Link>
      </div>
    </div>
  );
}
