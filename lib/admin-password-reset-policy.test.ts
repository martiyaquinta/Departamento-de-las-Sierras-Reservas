import { describe, expect, it } from "vitest";
import {
  decideAdminPasswordResetRequest,
  GENERIC_RESET_MESSAGE,
} from "@/lib/admin-password-reset";

describe("decideAdminPasswordResetRequest", () => {
  it("non-allowlist → shouldSend false, generic message", () => {
    const d = decideAdminPasswordResetRequest({
      email: "random@example.com",
      isAllowlisted: false,
      notifyEmail: "centrodelassierras@gmail.com",
    });
    expect(d.shouldSend).toBe(false);
    expect(d.to).toBeNull();
    expect(d.message).toBe(GENERIC_RESET_MESSAGE);
  });

  it("allowlist → shouldSend true, to notify email", () => {
    const d = decideAdminPasswordResetRequest({
      email: "centrodelassierras@gmail.com",
      isAllowlisted: true,
      notifyEmail: "centrodelassierras@gmail.com",
    });
    expect(d.shouldSend).toBe(true);
    expect(d.to).toBe("centrodelassierras@gmail.com");
    expect(d.message).toBe(GENERIC_RESET_MESSAGE);
  });

  it("public message identical on both paths", () => {
    const a = decideAdminPasswordResetRequest({
      email: "x@y.com",
      isAllowlisted: false,
      notifyEmail: "admin@x.com",
    });
    const b = decideAdminPasswordResetRequest({
      email: "admin@x.com",
      isAllowlisted: true,
      notifyEmail: "admin@x.com",
    });
    expect(a.message).toBe(b.message);
  });
});
