import { describe, expect, it } from "vitest";
import {
  createResetTokenMaterial,
  hashesMatch,
  isExpired,
  RESET_TOKEN_TTL_MS,
} from "@/lib/admin-password-reset";
import { normalizeAdminEmail } from "@/lib/admin-allowlist";

describe("admin-password-reset", () => {
  it("createResetTokenMaterial returns distinct plaintext and hash", () => {
    const m = createResetTokenMaterial();
    expect(m.token).toBeTruthy();
    expect(m.tokenHash).toBeTruthy();
    expect(m.token).not.toBe(m.tokenHash);
    expect(m.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("hashesMatch true for matching token, false otherwise", () => {
    const m = createResetTokenMaterial();
    expect(hashesMatch(m.token, m.tokenHash)).toBe(true);
    expect(hashesMatch("not-the-token", m.tokenHash)).toBe(false);
  });

  it("isExpired respects TTL 60m with injectable now", () => {
    const now = new Date("2026-01-01T12:00:00.000Z");
    const expiresAt = new Date(now.getTime() + RESET_TOKEN_TTL_MS);
    expect(isExpired(expiresAt, now)).toBe(false);
    expect(isExpired(expiresAt, new Date(expiresAt.getTime()))).toBe(true);
    expect(
      isExpired(expiresAt, new Date(expiresAt.getTime() + 1))
    ).toBe(true);
  });

  it("normalizeAdminEmail trims and lowercases", () => {
    expect(normalizeAdminEmail("  Foo@Bar.COM ")).toBe("foo@bar.com");
  });
});
