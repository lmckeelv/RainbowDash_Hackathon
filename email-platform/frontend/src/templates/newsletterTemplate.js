export function newsletterTemplate(subject, content) {
  return `
    <div style="font-family: Georgia, serif; padding: 24px; background: #f3f4f6; color: #111827;">
      <div style="max-width: 650px; margin: 0 auto; background: white; padding: 32px; border: 1px solid #d1d5db;">
        <h2 style="margin-bottom: 12px;">${subject || "Monthly Newsletter"}</h2>
        <hr style="margin: 16px 0;" />
        <p style="font-size: 16px; line-height: 1.8;">
          ${content || "Write your newsletter content here."}
        </p>
        <hr style="margin: 24px 0 16px;" />
        <p style="font-size: 12px; color: #6b7280;">Thanks for reading our newsletter.</p>
      </div>
    </div>
  `;
}