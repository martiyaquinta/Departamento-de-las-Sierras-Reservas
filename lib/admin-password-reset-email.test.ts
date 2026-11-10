import { describe, expect, it } from "vitest";
import { buildAdminPasswordResetEmail } from "@/lib/admin-password-reset-email";

describe("buildAdminPasswordResetEmail", () => {
  it("subject mentions reset and body contains url without plain password", () => {
    const resetUrl =
      "https://example.com/admin/reset-password?token=abcTOKEN123";
    const mail = buildAdminPasswordResetEmail({
      resetUrl,
      siteName: "De Las Sierras",
    });
    expect(mail.subject.toLowerCase()).toMatch(/restablecer|contraseña/);
    expect(mail.text).toContain(resetUrl);
    expect(mail.html).toContain(resetUrl);
    expect(mail.text.toLowerCase()).not.toContain("password=");
    expect(mail.html).not.toMatch(/password\s*=\s*["']?[^"'\s]+/i);
    expect(mail.text).not.toContain("abcTOKEN123 plain secret");
  });
});
