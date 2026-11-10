"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resetAdminPasswordAction } from "@/lib/actions/admin";

export function ResetPasswordForm({
  token,
  initialError,
}: {
  token: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pending, startTransition] = useTransition();

  if (initialError || !token) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm bg-crema">
          <CardHeader className="items-center text-center">
            <CardTitle className="font-serif text-xl">Enlace no válido</CardTitle>
            <p className="text-sm text-muted-foreground">
              {initialError || "Falta el token de restablecimiento."}
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Link
              href="/admin/login"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Volver al login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await resetAdminPasswordAction(token, password, confirm);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Contraseña actualizada. Ingresá con la nueva clave.");
      router.push("/admin/login");
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm bg-crema">
        <CardHeader className="items-center text-center">
          <Image src="/brand/logo-sinfondo.png" alt="" width={64} height={64} className="mb-2" />
          <CardTitle className="font-serif text-xl">Nueva contraseña</CardTitle>
          <p className="text-xs text-muted-foreground">Admin · De Las Sierras</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  minLength={8}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Guardando..." : "Guardar contraseña"}
            </Button>
            <p className="text-center text-sm">
              <Link
                href="/admin/login"
                className="text-muted-foreground underline-offset-4 hover:underline"
              >
                Volver al login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
