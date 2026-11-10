import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEYLEN = 64;
const SALT_LEN = 16;

function scryptKey(
  plain: string,
  salt: Buffer,
  keylen: number,
  opts: { N: number; r: number; p: number }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(plain, salt, keylen, opts, (err, derived) => {
      if (err) reject(err);
      else resolve(derived as Buffer);
    });
  });
}

/** Format: scrypt$n$r$p$saltB64$keyB64 */
export async function hashAdminPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const key = await scryptKey(plain, salt, KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return [
    "scrypt",
    String(SCRYPT_N),
    String(SCRYPT_R),
    String(SCRYPT_P),
    salt.toString("base64url"),
    key.toString("base64url"),
  ].join("$");
}

export async function verifyAdminPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  const parts = hash.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  const salt = Buffer.from(parts[4], "base64url");
  const expected = Buffer.from(parts[5], "base64url");
  if (!n || !r || !p || salt.length === 0 || expected.length === 0) return false;

  const key = await scryptKey(plain, salt, expected.length, { N: n, r, p });
  if (key.length !== expected.length) return false;
  return timingSafeEqual(key, expected);
}

export function isPasswordStrongEnough(plain: string): boolean {
  return plain.length >= 8;
}

export type LoginPasswordResolution =
  | { ok: true; source: "override" | "env" }
  | { ok: false };

/** Core SoT: override hash wins over ADMIN_PASSWORD env bootstrap. */
export async function resolveAdminLoginPassword(input: {
  plain: string;
  overrideHash: string | null | undefined;
  envAdminPassword: string;
}): Promise<LoginPasswordResolution> {
  const plain = input.plain;
  const env = (input.envAdminPassword ?? "").trim();
  const override = input.overrideHash?.trim() || null;

  if (override) {
    const match = await verifyAdminPassword(plain, override);
    return match ? { ok: true, source: "override" } : { ok: false };
  }

  if (!env) return { ok: false };
  return plain === env ? { ok: true, source: "env" } : { ok: false };
}
