import { describe, expect, it } from "vitest";
import {
  hashAdminPassword,
  isPasswordStrongEnough,
  resolveAdminLoginPassword,
  verifyAdminPassword,
} from "@/lib/admin-password";

describe("admin-password", () => {
  it("hash + verify true for same plain", async () => {
    const plain = "secreto-sierras-99";
    const hash = await hashAdminPassword(plain);
    expect(await verifyAdminPassword(plain, hash)).toBe(true);
  });

  it("verify false for different plain", async () => {
    const hash = await hashAdminPassword("correct-horse");
    expect(await verifyAdminPassword("wrong-battery", hash)).toBe(false);
  });

  it("two hashes of same plain differ (salt) but both verify", async () => {
    const plain = "same-plain-password";
    const a = await hashAdminPassword(plain);
    const b = await hashAdminPassword(plain);
    expect(a).not.toBe(b);
    expect(await verifyAdminPassword(plain, a)).toBe(true);
    expect(await verifyAdminPassword(plain, b)).toBe(true);
  });

  it("isPasswordStrongEnough rejects <8 and accepts >=8", () => {
    expect(isPasswordStrongEnough("short")).toBe(false);
    expect(isPasswordStrongEnough("1234567")).toBe(false);
    expect(isPasswordStrongEnough("12345678")).toBe(true);
    expect(isPasswordStrongEnough("long-enough-pass")).toBe(true);
  });
});

describe("resolveAdminLoginPassword", () => {
  it("without override accepts only env password", async () => {
    const ok = await resolveAdminLoginPassword({
      plain: "env-secret",
      overrideHash: null,
      envAdminPassword: "env-secret",
    });
    expect(ok).toEqual({ ok: true, source: "env" });

    const bad = await resolveAdminLoginPassword({
      plain: "other",
      overrideHash: null,
      envAdminPassword: "env-secret",
    });
    expect(bad).toEqual({ ok: false });
  });

  it("with override accepts verify match and ignores different env", async () => {
    const plain = "new-override-pass";
    const hash = await hashAdminPassword(plain);
    const ok = await resolveAdminLoginPassword({
      plain,
      overrideHash: hash,
      envAdminPassword: "old-env-password",
    });
    expect(ok).toEqual({ ok: true, source: "override" });
  });

  it("with override rejects env plain that does not match hash", async () => {
    const hash = await hashAdminPassword("real-new-password");
    const bad = await resolveAdminLoginPassword({
      plain: "old-env-password",
      overrideHash: hash,
      envAdminPassword: "old-env-password",
    });
    expect(bad).toEqual({ ok: false });
  });
});

