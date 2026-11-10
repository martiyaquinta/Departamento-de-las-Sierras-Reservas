import { isPasswordStrongEnough } from "@/lib/admin-password";
import {
  hashResetToken,
  hashesMatch,
  isExpired,
} from "@/lib/admin-password-reset";

export type ResetTokenRow = {
  id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
};

export type ResetTokenStore = {
  findActiveByHash: (tokenHash: string) => Promise<ResetTokenRow | null>;
  markUsed: (id: string) => Promise<void>;
};

export type ConsumeResetResult =
  | { ok: true }
  | { ok: false; error: string };

export async function consumeValidResetToken(input: {
  tokenPlain: string;
  newPassword: string;
  confirmPassword: string;
  now?: Date;
  store: ResetTokenStore;
  setPassword: (plain: string) => Promise<void>;
}): Promise<ConsumeResetResult> {
  const now = input.now ?? new Date();

  if (!isPasswordStrongEnough(input.newPassword)) {
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres" };
  }
  if (input.newPassword !== input.confirmPassword) {
    return { ok: false, error: "Las contraseñas no coinciden" };
  }

  const tokenHash = hashResetToken(input.tokenPlain);
  const row = await input.store.findActiveByHash(tokenHash);
  if (!row || row.used_at) {
    return { ok: false, error: "Enlace inválido o ya usado" };
  }
  if (!hashesMatch(input.tokenPlain, row.token_hash)) {
    return { ok: false, error: "Enlace inválido o ya usado" };
  }
  if (isExpired(new Date(row.expires_at), now)) {
    return { ok: false, error: "El enlace expiró. Pedí uno nuevo." };
  }

  await input.setPassword(input.newPassword);
  await input.store.markUsed(row.id);
  return { ok: true };
}
