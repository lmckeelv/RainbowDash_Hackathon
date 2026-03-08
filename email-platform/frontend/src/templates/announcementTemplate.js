export function announcementTemplate(subject, content) {
  return `
    <div style="font-family: Verdana, sans-serif; padding: 24px; background: #111827; color: white;">
      <div style="max-width: 600px; margin: 0 auto; background: #1f2937; border-radius: 12px; padding: 32px;">
        <h1 style="margin-bottom: 20px; text-align: center;">${subject || "Important Announcement"}</h1>
        <p style="font-size: 16px; line-height: 1.7; text-align: center;">
          ${content || "Write your announcement here."}
        </p>
      </div>
    </div>
  `;
}