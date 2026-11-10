import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/admin/reset-password-form";
import { getAdminResetTokenStatusAction } from "@/lib/actions/admin";

async function ResetPasswordInner({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const sp = await searchParams;
  const token = (sp.token ?? "").trim();
  if (!token) {
    return <ResetPasswordForm token="" initialError="Falta el token de restablecimiento." />;
  }
  const status = await getAdminResetTokenStatusAction(token);
  if (!status.valid) {
    return (
      <ResetPasswordForm
        token={token}
        initialError={status.error || "Enlace inválido o expirado"}
      />
    );
  }
  return <ResetPasswordForm token={token} />;
}

export default function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted-foreground">
          Cargando...
        </div>
      }
    >
      <ResetPasswordInner searchParams={searchParams} />
    </Suspense>
  );
}
