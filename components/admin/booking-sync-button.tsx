"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { syncBookingIcalAction } from "@/lib/actions/admin";

export function BookingSyncButton() {
  const [pending, start] = useTransition();
  const [last, setLast] = useState<string | null>(null);

  function onSync() {
    start(async () => {
      const res = await syncBookingIcalAction();
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const msg = `Booking sync: ${res.data?.events ?? 0} eventos · ${res.data?.nightsBusy ?? 0} noches · liberadas ${res.data?.released ?? 0}`;
      toast.success(msg);
      setLast(res.data?.fetchedAt ?? new Date().toISOString());
    });
  }

  return (
    <div className="space-y-2">
      <Button type="button" size="sm" onClick={onSync} disabled={pending}>
        {pending ? "Sincronizando…" : "Sincronizar Booking ahora"}
      </Button>
      {last ? (
        <p className="text-xs text-muted-foreground">
          Última sync (esta sesión): {new Date(last).toLocaleString("es-AR")}
        </p>
      ) : null}
    </div>
  );
}
