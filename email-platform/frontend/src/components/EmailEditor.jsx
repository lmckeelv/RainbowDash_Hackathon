import { useState } from "react";

const API = "http://localhost:8000";

export default function EmailEditor({ onContactsReady }) {
  const [recipients, setRecipients]     = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [replyTo, setReplyTo]           = useState("");
  const [subject, setSubject]           = useState("");
  const [businessName, setBusinessName] = useState("");
  const [header, setHeader]             = useState("");
  const [body, setBody]                 = useState("");
  const [website, setWebsite]           = useState("");
  const [sending, setSending]           = useState(false);
  const [sendResult, setSendResult]     = useState(null);

  const hasRecipients = recipients.length > 0;
  const canSend = hasRecipients && subject.trim() && body.trim();

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadStatus({ loading: true });
    setRecipients([]);
    setSendResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API}/upload-contacts`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      setRecipients(data.recipients);
      setUploadStatus(data);
      onContactsReady?.(data.recipients);
    } catch (err) {
      setUploadStatus({ error: err.message });
    }
  }

  async function handleSend() {
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch(`${API}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients, reply_to: replyTo, subject, body: buildHtml() }),
      });
      const data = await res.json();
      setSendResult(data);
    } catch (err) {
      setSendResult({ error: err.message });
    } finally {
      setSending(false);
    }
  }

  function buildHtml() {
    const paragraphs = body
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map(l => `<p style="margin:0 0 12px">${l}</p>`)
      .join("");

    const footerLink = website
      ? `<p style="margin-top:24px"><a href="${website}" style="color:#2563eb">${website}</a></p>`
      : "";

    return `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
        ${businessName ? `<p style="font-size:13px;color:#888;margin:0 0 16px">${businessName}</p>` : ""}
        ${header ? `<h2 style="margin:0 0 16px;font-size:22px">${header}</h2>` : ""}
        <p style="margin:0 0 16px">Hi {{name}},</p>
        ${paragraphs}
        ${footerLink}
        <hr style="margin-top:32px;border:none;border-top:1px solid #eee"/>
        ${businessName ? `<p style="font-size:12px;color:#aaa;margin-top:12px">&copy; ${businessName}</p>` : ""}
      </div>
    `;
  }

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 560, margin: "40px auto", padding: "0 16px" }}>
      <h2>📧 Email Tool</h2>

      {/* Recipients */}
      <section style={card}>
        <h3 style={sectionTitle}>1. Recipients</h3>
        <p style={hintStyle}>Upload a CSV with <code>name</code> and <code>email</code> columns.</p>
        <input type="file" accept=".csv,.txt" onChange={handleFileChange} />
        {uploadStatus?.loading && <p style={mutedStyle}>Uploading…</p>}
        {uploadStatus?.error && <p style={errorStyle}>{uploadStatus.error}</p>}
        {uploadStatus && !uploadStatus.error && !uploadStatus.loading && (
          <div style={{ marginTop: 10, fontSize: 13 }}>
            <p style={{ margin: "4px 0" }}>✅ <strong>{uploadStatus.valid_count}</strong> valid recipient{uploadStatus.valid_count !== 1 ? "s" : ""}</p>
            {uploadStatus.duplicate_count > 0 && <p style={{ margin: "4px 0" }}>🔁 {uploadStatus.duplicate_count} duplicate{uploadStatus.duplicate_count !== 1 ? "s" : ""} removed</p>}
            {uploadStatus.invalid_count > 0 && <p style={{ margin: "4px 0" }}>⚠️ {uploadStatus.invalid_count} invalid email{uploadStatus.invalid_count !== 1 ? "s" : ""} skipped</p>}
          </div>
        )}
      </section>

      {/* Compose */}
      <section style={card}>
        <h3 style={sectionTitle}>2. Compose</h3>

        <label style={labelStyle}>Subject <Required /></label>
        <input style={inputStyle} value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Big news from Acme!" />

        <label style={labelStyle}>Business Name</label>
        <input style={inputStyle} value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Acme Co." />

        <label style={labelStyle}>Header</label>
        <input style={inputStyle} value={header} onChange={e => setHeader(e.target.value)} placeholder="e.g. We have exciting news for you!" />

        <label style={labelStyle}>Body <Required /></label>
        <p style={hintStyle}>Each line becomes a paragraph. All emails start with "Hi [name]," automatically.</p>
        <textarea
          style={{ ...inputStyle, resize: "vertical" }}
          rows={5}
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Write your message here..."
        />

        <label style={labelStyle}>Website</label>
        <input style={inputStyle} value={website} onChange={e => setWebsite(e.target.value)} placeholder="e.g. https://acme.com" />

        <label style={labelStyle}>Reply-To Email</label>
        <p style={hintStyle}>Replies from recipients will go to this address.</p>
        <input style={inputStyle} value={replyTo} onChange={e => setReplyTo(e.target.value)} placeholder="e.g. hello@acme.com" />
      </section>

      {/* Send */}
      <section style={card}>
        <p style={mutedStyle}>
          {!hasRecipients
            ? "⬆️ Upload a CSV above to enable sending."
            : !subject.trim() || !body.trim()
            ? "✏️ Fill in subject and body to send."
            : `🚀 Ready to send to ${recipients.length} recipient${recipients.length !== 1 ? "s" : ""}.`}
        </p>
        <button
          onClick={handleSend}
          disabled={!canSend || sending}
          style={{ ...btnStyle, opacity: canSend ? 1 : 0.45, cursor: canSend ? "pointer" : "not-allowed" }}
        >
          {sending ? "Sending…" : hasRecipients ? `Send to ${recipients.length} recipient${recipients.length !== 1 ? "s" : ""}` : "Send"}
        </button>

        {sendResult && (
          <div style={{ marginTop: 12, fontSize: 13 }}>
            {sendResult.error
              ? <p style={errorStyle}>{sendResult.error}</p>
              : <>
                  <p style={{ margin: "4px 0" }}>✅ Sent: <strong>{sendResult.sent_count}</strong></p>
                  {sendResult.error_count > 0 && <p style={{ ...errorStyle, margin: "4px 0" }}>❌ Failed: {sendResult.error_count}</p>}
                </>
            }
          </div>
        )}
      </section>
    </div>
  );
}

function Required() {
  return <span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>;
}

const card         = { background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 8, padding: "16px 20px", marginBottom: 16 };
const sectionTitle = { margin: "0 0 6px", fontSize: 16 };
const errorStyle   = { color: "red", margin: "6px 0 0", fontSize: 13 };
const mutedStyle   = { fontSize: 13, color: "#888", margin: "0 0 10px" };
const hintStyle    = { fontSize: 12, color: "#888", margin: "2px 0 6px" };
const labelStyle   = { display: "block", fontSize: 13, fontWeight: 600, marginTop: 12, marginBottom: 2 };
const inputStyle   = { width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", boxSizing: "border-box" };
const btnStyle     = { padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600 };