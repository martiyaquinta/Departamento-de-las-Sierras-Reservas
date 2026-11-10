import { describe, expect, it, vi } from "vitest";
import {
  consumeValidResetToken,
  type ResetTokenStore,
} from "@/lib/admin-password-reset-flow";
import {
  createResetTokenMaterial,
  hashResetToken,
} from "@/lib/admin-password-reset";

describe("consumeValidResetToken", () => {
  it("valid token → marks used and returns ok", async () => {
    const material = createResetTokenMaterial(new Date("2026-06-01T10:00:00Z"));
    const row = {
      id: "tok-1",
      token_hash: material.tokenHash,
      expires_at: material.expiresAt.toISOString(),
      used_at: null as string | null,
    };
    const store: ResetTokenStore = {
      findActiveByHash: vi.fn(async (hash) =>
        hash === row.token_hash ? { ...row } : null
      ),
      markUsed: vi.fn(async () => {}),
    };
    const setPassword = vi.fn(async () => {});

    const result = await consumeValidResetToken({
      tokenPlain: material.token,
      newPassword: "nueva-clave-12",
      confirmPassword: "nueva-clave-12",
      now: new Date("2026-06-01T10:30:00Z"),
      store,
      setPassword,
    });

    expect(result).toEqual({ ok: true });
    expect(store.markUsed).toHaveBeenCalledWith("tok-1");
    expect(setPassword).toHaveBeenCalledWith("nueva-clave-12");
  });

  it("used or bad token fails", async () => {
    const store: ResetTokenStore = {
      findActiveByHash: vi.fn(async () => null),
      markUsed: vi.fn(async () => {}),
    };
    const result = await consumeValidResetToken({
      tokenPlain: "garbage",
      newPassword: "nueva-clave-12",
      confirmPassword: "nueva-clave-12",
      now: new Date(),
      store,
      setPassword: vi.fn(),
    });
    expect(result.ok).toBe(false);
    expect(store.markUsed).not.toHaveBeenCalled();
  });

  it("rejects weak or mismatched password without consuming", async () => {
    const material = createResetTokenMaterial();
    const store: ResetTokenStore = {
      findActiveByHash: vi.fn(async () => ({
        id: "t1",
        token_hash: material.tokenHash,
        expires_at: material.expiresAt.toISOString(),
        used_at: null,
      })),
      markUsed: vi.fn(async () => {}),
    };
    const weak = await consumeValidResetToken({
      tokenPlain: material.token,
      newPassword: "short",
      confirmPassword: "short",
      now: new Date(),
      store,
      setPassword: vi.fn(),
    });
    expect(weak.ok).toBe(false);
    expect(store.markUsed).not.toHaveBeenCalled();

    const mismatch = await consumeValidResetToken({
      tokenPlain: material.token,
      newPassword: "long-enough-1",
      confirmPassword: "long-enough-2",
      now: new Date(),
      store,
      setPassword: vi.fn(),
    });
    expect(mismatch.ok).toBe(false);
    expect(store.markUsed).not.toHaveBeenCalled();
  });

  it("hashResetToken is stable for lookups", () => {
    const a = hashResetToken("same");
    const b = hashResetToken("same");
    expect(a).toBe(b);
  });
});
