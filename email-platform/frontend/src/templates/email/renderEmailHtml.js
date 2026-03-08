function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toParagraphs(content = "") {
  const blocks = content.trim().split(/\n{2,}/).filter(Boolean);
  if (blocks.length === 0) {
    return '<p style="margin:0;color:#475569;font-size:15px;line-height:1.7;">Start writing your email content.</p>';
  }

  return blocks
    .map((block) => {
      const lineBreaks = escapeHtml(block).replaceAll("\n", "<br />");
      return `<p style="margin:0 0 14px;color:#334155;font-size:15px;line-height:1.7;">${lineBreaks}</p>`;
    })
    .join("");
}

function safeUrl(url = "") {
  const clean = url.trim();
  if (!clean) return "https://example.com";
  if (/^(https?:\/\/|mailto:)/i.test(clean)) return clean;
  return `https://${clean}`;
}

function baseDocument(innerHtml, preheader) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Campaign Email</title>
  </head>
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    ${innerHtml}
  </body>
</html>`;
}

function renderPromo(data) {
  return baseDocument(
    `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #bbf7d0;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="padding:30px;background:linear-gradient(120deg,#22c55e,#16a34a);color:#ffffff;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.9;">Simple Promo</p>
          <h1 style="margin:0;font-size:28px;line-height:1.2;">${escapeHtml(data.subject)}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px 32px;">
          ${toParagraphs(data.body)}
          <a href="${escapeHtml(safeUrl(data.ctaUrl))}" style="display:inline-block;margin-top:10px;padding:12px 20px;border-radius:999px;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;">
            ${escapeHtml(data.ctaText)}
          </a>
          <p style="margin:24px 0 0;color:#64748b;font-size:12px;line-height:1.6;">Sent by ${escapeHtml(data.companyName)}.</p>
        </td>
      </tr>
    </table>
  `,
    data.preheader,
  );
}

function renderNewsletter(data) {
  return baseDocument(
    `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:660px;margin:0 auto;background:#ffffff;border:1px solid #bfdbfe;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="padding:26px 30px;border-bottom:1px solid #dbeafe;background:#eff6ff;">
          <p style="margin:0;color:#1d4ed8;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;">Newsletter</p>
          <h1 style="margin:10px 0 0;color:#1e3a8a;font-size:27px;line-height:1.25;">${escapeHtml(data.subject)}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 30px;">
          ${toParagraphs(data.body)}
          <a href="${escapeHtml(safeUrl(data.ctaUrl))}" style="display:inline-block;margin-top:10px;padding:12px 18px;border-radius:8px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;">
            ${escapeHtml(data.ctaText)}
          </a>
          <p style="margin:24px 0 0;color:#64748b;font-size:12px;line-height:1.6;">Sent by ${escapeHtml(data.companyName)}.</p>
        </td>
      </tr>
    </table>
  `,
    data.preheader,
  );
}

function renderAnnouncement(data) {
  return baseDocument(
    `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e9d5ff;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="padding:30px;background:#7c3aed;color:#ffffff;">
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">Announcement</p>
          <h1 style="margin:0;font-size:28px;line-height:1.2;">${escapeHtml(data.subject)}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px 32px;">
          ${toParagraphs(data.body)}
          <a href="${escapeHtml(safeUrl(data.ctaUrl))}" style="display:inline-block;margin-top:10px;padding:12px 20px;border-radius:10px;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;">
            ${escapeHtml(data.ctaText)}
          </a>
          <p style="margin:24px 0 0;color:#64748b;font-size:12px;line-height:1.6;">Sent by ${escapeHtml(data.companyName)}.</p>
        </td>
      </tr>
    </table>
  `,
    data.preheader,
  );
}

const RENDERERS = {
  promo: renderPromo,
  newsletter: renderNewsletter,
  announcement: renderAnnouncement,
};

export function renderEmailHtml(templateId, data) {
  const renderer = RENDERERS[templateId] ?? RENDERERS.promo;
  return renderer({
    subject: data.subject || "",
    preheader: data.preheader || "",
    body: data.body || "",
    ctaText: data.ctaText || "Learn More",
    ctaUrl: data.ctaUrl || "https://example.com",
    companyName: data.companyName || "Your Company",
  });
}
