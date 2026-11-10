"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  loginAction,
  requestAdminPasswordResetAction,
} from "@/lib/actions/admin";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await loginAction(email, password);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Bienvenido");
      router.push(search.get("next") || "/admin");
      router.refresh();
    });
  }

  function onForgot(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await requestAdminPasswordResetAction(forgotEmail || email);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(res.data?.message ?? "Si el email está autorizado, vas a recibir instrucciones.");
      setMode("login");
    });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm bg-crema">
        <CardHeader className="items-center text-center">
          <Image src="/brand/logo-sinfondo.png" alt="" width={64} height={64} className="mb-2" />
          <CardTitle className="font-serif text-xl">Admin · De Las Sierras</CardTitle>
          <p className="text-xs text-muted-foreground">
            {mode === "login"
              ? "Acceso privado del departamento."
              : "Te enviamos un enlace al mail autorizado."}
          </p>
        </CardHeader>
        <CardContent>
          {mode === "login" ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
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
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Entrando..." : "Entrar"}
              </Button>
              <button
                type="button"
                className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
                onClick={() => {
                  setForgotEmail(email);
                  setMode("forgot");
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          ) : (
            <form onSubmit={onForgot} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="email@..."
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Enviando..." : "Enviar enlace"}
              </Button>
              <button
                type="button"
                className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
                onClick={() => setMode("login")}
              >
                Volver al login
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
