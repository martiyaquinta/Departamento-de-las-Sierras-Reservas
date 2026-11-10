import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
export const RESET_REQUEST_MAX_PER_HOUR = 5;

export type ResetTokenMaterial = {
  token: string;
  tokenHash: string;
  expiresAt: Date;
};

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("base64url");
}

export function createResetTokenMaterial(
  now: Date = new Date()
): ResetTokenMaterial {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(now.getTime() + RESET_TOKEN_TTL_MS);
  return { token, tokenHash, expiresAt };
}

export function hashesMatch(tokenPlain: string, tokenHash: string): boolean {
  const computed = Buffer.from(hashResetToken(tokenPlain), "utf8");
  const expected = Buffer.from(tokenHash, "utf8");
  if (computed.length !== expected.length) return false;
  return timingSafeEqual(computed, expected);
}

export function isExpired(expiresAt: Date, now: Date = new Date()): boolean {
  return now.getTime() >= expiresAt.getTime();
}

export const GENERIC_RESET_MESSAGE =
  "Si el email está autorizado, vas a recibir instrucciones.";

export type ResetRequestDecision = {
  shouldSend: boolean;
  message: string;
  to: string | null;
};

export function decideAdminPasswordResetRequest(input: {
  email: string;
  isAllowlisted: boolean;
  notifyEmail: string;
}): ResetRequestDecision {
  const message = GENERIC_RESET_MESSAGE;
  if (!input.isAllowlisted) {
    return { shouldSend: false, message, to: null };
  }
  const to = (input.notifyEmail || "").trim() || input.email;
  return { shouldSend: true, message, to };
}
