"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Property } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePropertyPriceAction } from "@/lib/actions/admin";
import { formatARS, formatMoney } from "@/lib/utils";
import {
  DEFAULT_PRICE_MULTI_NIGHT_USD,
  DEFAULT_PRICE_ONE_NIGHT_USD,
  USD_ARS_RATE,
  arsToUsd,
  usdToArs,
} from "@/lib/fx";

export function PrecioForm({ property }: { property: Property }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const initialOneUsd =
    property.price_one_night != null && property.price_one_night > 0
      ? arsToUsd(property.price_one_night)
      : DEFAULT_PRICE_ONE_NIGHT_USD;
  const initialMultiUsd =
    property.price_per_night > 0
      ? arsToUsd(property.price_per_night)
      : DEFAULT_PRICE_MULTI_NIGHT_USD;
  const initialCleaningUsd =
    property.cleaning_fee > 0 ? arsToUsd(property.cleaning_fee) : 0;

  const [oneUsd, setOneUsd] = useState(String(initialOneUsd));
  const [multiUsd, setMultiUsd] = useState(String(initialMultiUsd));
  const [cleaningUsd, setCleaningUsd] = useState(String(initialCleaningUsd));
  const [minNights, setMinNights] = useState(String(property.min_nights || 1));
  const [rate, setRate] = useState(String(USD_ARS_RATE));

  const oneNum = Number(oneUsd) || 0;
  const multiNum = Number(multiUsd) || 0;
  const cleaningNum = Number(cleaningUsd) || 0;
  const rateNum = Number(rate) > 0 ? Number(rate) : USD_ARS_RATE;

  const oneArs = useMemo(() => usdToArs(oneNum, rateNum), [oneNum, rateNum]);
  const multiArs = useMemo(() => usdToArs(multiNum, rateNum), [multiNum, rateNum]);
  const cleaningArs = useMemo(
    () => usdToArs(cleaningNum, rateNum),
    [cleaningNum, rateNum]
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updatePropertyPriceAction({
        price_one_night_usd: oneUsd,
        price_multi_night_usd: multiUsd,
        cleaning_fee_usd: cleaningUsd,
        min_nights: minNights,
        usd_ars_rate: rate,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Precios guardados — la web los muestra en pesos");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-xl border border-primary/20 bg-crema p-4 text-sm">
        <p className="text-xs text-muted-foreground">
          Editás en <strong>USD</strong> · la web publica en <strong>pesos</strong>
        </p>
        <div className="mt-2 space-y-1">
          <p className="text-base font-semibold text-primary">
            1 noche: {formatMoney(oneNum, "USD")} → {formatARS(oneArs)}
          </p>
          <p className="text-base font-semibold text-primary">
            2+ noches: {formatMoney(multiNum, "USD")}/noche → {formatARS(multiArs)}
            /noche
          </p>
          {cleaningNum > 0 && (
            <p className="text-xs text-muted-foreground">
              + limpieza {formatMoney(cleaningNum, "USD")} → {formatARS(cleaningArs)}
            </p>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Ejemplo finde vie→dom (2 noches): {formatARS(multiArs * 2)}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="one">Precio 1 noche (USD)</Label>
        <Input
          id="one"
          type="number"
          min={0}
          step={1}
          value={oneUsd}
          onChange={(e) => setOneUsd(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">Default pedido: 80 USD</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="multi">Precio por noche · 2 o más (USD)</Label>
        <Input
          id="multi"
          type="number"
          min={0}
          step={1}
          value={multiUsd}
          onChange={(e) => setMultiUsd(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">Default pedido: 60 USD / noche</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cleaning">Fee limpieza (USD)</Label>
        <Input
          id="cleaning"
          type="number"
          min={0}
          step={1}
          value={cleaningUsd}
          onChange={(e) => setCleaningUsd(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rate">Cotización ARS por 1 USD</Label>
        <Input
          id="rate"
          type="number"
          min={1}
          step={1}
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Blue venta de referencia al armar defaults: {USD_ARS_RATE}. Cambiala acá si
          querés republicar con otra cotización.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="min">Mínimo de noches</Label>
        <Input
          id="min"
          type="number"
          min={1}
          value={minNights}
          onChange={(e) => setMinNights(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Guardando..." : "Guardar precios"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Al guardar se actualiza la landing y el flujo de reserva al instante (en pesos).
      </p>
    </form>
  );
}
