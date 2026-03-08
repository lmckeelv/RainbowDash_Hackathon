// should handle subject input, body input, 
// slected template state and generated HTML state.

import React, { useMemo, useState } from "react";
import TemplatePicker from "./TemplatePicker";
import EmailPreview from "./EmailPreview";
import { promoTemplate } from "../templates/promoTemplate";
import { newsletterTemplate } from "../templates/newsletterTemplate";
import { announcementTemplate } from "../templates/announcementTemplate";

export default function EmailEditor() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("promo");

  const generatedHtml = useMemo(() => {
    if (selectedTemplate === "promo") return promoTemplate(subject, content);
    if (selectedTemplate === "newsletter") return newsletterTemplate(subject, content);
    if (selectedTemplate === "announcement") return announcementTemplate(subject, content);
    return "";
  }, [subject, content, selectedTemplate]);

  return (
  <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
    <h1>Email Builder</h1>

    <input
      type="text"
      placeholder="Enter email subject"
      value={subject}
      onChange={(e) => setSubject(e.target.value)}
      style={{
        width: "100%",
        padding: "12px",
        marginBottom: "12px",
        borderRadius: "8px",
        border: "1px solid #ccc"
      }}
    />

    <textarea
      placeholder="Write your email content"
      value={content}
      onChange={(e) => setContent(e.target.value)}
      rows={8}
      style={{
        width: "100%",
        padding: "12px",
        marginBottom: "16px",
        borderRadius: "8px",
        border: "1px solid #ccc"
      }}
    />

    <TemplatePicker
      selectedTemplate={selectedTemplate}
      onSelect={setSelectedTemplate}
    />

    <EmailPreview html={generatedHtml} />
  </div>
);
}