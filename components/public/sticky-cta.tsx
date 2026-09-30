import Link from "next/link";
import { formatARS } from "@/lib/utils";

export function StickyCta({
  priceFrom,
  priceOneNight,
}: {
  /** ARS · tarifa “desde” (2+ noches / noche) */
  priceFrom: number;
  /** ARS · 1 noche (más cara); opcional */
  priceOneNight?: number | null;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-crema/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Desde</p>
          <p className="truncate font-semibold text-marron">
            {formatARS(priceFrom)}
            <span className="text-xs font-normal text-muted-foreground">
              {" "}
              / noche · 2+
            </span>
          </p>
          {priceOneNight != null && priceOneNight > 0 && (
            <p className="truncate text-xs text-muted-foreground">
              {formatARS(priceOneNight)} · 1 noche
            </p>
          )}
        </div>
        <Link
          href="/reservar"
          className="shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-md"
        >
          Reservar finde
        </Link>
      </div>
    </div>
  );
}
