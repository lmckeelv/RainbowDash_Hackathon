export function promoTemplate(subject, content) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 24px; background: #f9fafb; color: #111827;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; border: 1px solid #e5e7eb;">
        <h1 style="margin-bottom: 16px; color: #2563eb;">${subject || "Special Promotion"}</h1>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          ${content || "Write your promotional email here."}
        </p>
        <a href="#" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 20px; border-radius: 8px;">
          Learn More
        </a>
      </div>
    </div>
  `;
}