export function buildAdminPasswordResetEmail(input: {
  resetUrl: string;
  siteName?: string;
}): { subject: string; text: string; html: string } {
  const siteName = input.siteName?.trim() || "De Las Sierras";
  const subject = `Restablecer acceso admin — ${siteName}`;
  const text = [
    `Restablecer contraseña del panel admin — ${siteName}`,
    "",
    "Recibimos un pedido para cambiar la contraseña del acceso admin.",
    "Si no lo pediste, ignorá este mail.",
    "",
    `Abrí este enlace (válido 60 minutos, un solo uso):`,
    input.resetUrl,
    "",
    "No compartas este enlace. Nunca te pedimos la contraseña por mail.",
  ].join("\n");

  const html = `
  <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#3c2a21;background:#faf6f0;padding:24px;border-radius:12px;border:1px solid #e8d5c4">
    <h1 style="font-size:22px;margin:0 0 8px">Restablecer acceso admin</h1>
    <p style="margin:0 0 16px;color:#7a8471">${escapeHtml(siteName)} · enlace de un solo uso</p>
    <p style="margin:0 0 16px">Recibimos un pedido para cambiar la contraseña del panel admin. Si no lo pediste, ignorá este mail.</p>
    <p style="margin:20px 0 0">
      <a href="${escapeAttr(input.resetUrl)}" style="display:inline-block;background:#c47a4a;color:#faf6f0;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">
        Elegir nueva contraseña
      </a>
    </p>
    <p style="margin:16px 0 0;font-size:13px;color:#7a8471;word-break:break-all">${escapeHtml(input.resetUrl)}</p>
    <p style="margin:16px 0 0;font-size:12px;color:#7a8471">Válido 60 minutos. Un solo uso. No compartas este enlace.</p>
  </div>`.trim();

  return { subject, text, html };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
