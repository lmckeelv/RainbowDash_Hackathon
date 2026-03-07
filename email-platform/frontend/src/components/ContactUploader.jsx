import { useState } from "react";

const API = "http://localhost:8000";

export default function ContactUploader({ onContactsReady }) {
  const [status, setStatus]     = useState(null);   // upload result summary
  const [recipients, setRecipients] = useState([]);
  const [sending, setSending]   = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [subject, setSubject]   = useState("Test Email");
  const [body, setBody]         = useState("<p>Hello! This is a test email.</p>");

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setStatus(null);
    setSendResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/upload-contacts`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Upload failed");

      setRecipients(data.recipients);
      setStatus(data);
      onContactsReady?.(data.recipients);
    } catch (err) {
      setStatus({ error: err.message });
    }
  }

  async function handleSend() {
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch(`${API}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients, subject, body }),
      });
      const data = await res.json();
      setSendResult(data);
    } catch (err) {
      setSendResult({ error: err.message });
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 560, margin: "40px auto", padding: "0 16px" }}>
      <h2>📧 Email Tool</h2>

      {/* Upload */}
      <section style={card}>
        <h3>1. Upload Contacts</h3>
        <input type="file" accept=".csv,.txt" onChange={handleFileChange} />

        {status?.error && <p style={errorStyle}>{status.error}</p>}

        {status && !status.error && (
          <div style={{ marginTop: 12 }}>
            <p>✅ <strong>{status.valid_count}</strong> valid recipients</p>
            {status.duplicate_count > 0 && <p>🔁 {status.duplicate_count} duplicates removed</p>}
            {status.invalid_count > 0 && (
              <>
                <p>⚠️ {status.invalid_count} invalid emails skipped:</p>
                <ul style={{ fontSize: 12, color: "#888" }}>
                  {status.invalid_emails.map(e => <li key={e}>{e}</li>)}
                </ul>
              </>
            )}
          </div>
        )}
      </section>

      {/* Compose */}
      {recipients.length > 0 && (
        <section style={card}>
          <h3>2. Compose Test Email</h3>
          <label style={labelStyle}>Subject</label>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            style={inputStyle}
          />
          <label style={labelStyle}>Body (HTML)</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={5}
            style={{ ...inputStyle, resize: "vertical" }}
          />
          <button onClick={handleSend} disabled={sending} style={btnStyle}>
            {sending ? "Sending…" : `Send to ${recipients.length} recipient${recipients.length !== 1 ? "s" : ""}`}
          </button>
        </section>
      )}

      {/* Send result */}
      {sendResult && (
        <section style={card}>
          {sendResult.error
            ? <p style={errorStyle}>{sendResult.error}</p>
            : <>
                <p>✅ Sent: <strong>{sendResult.sent_count}</strong></p>
                {sendResult.error_count > 0 && <p>❌ Failed: {sendResult.error_count}</p>}
              </>
          }
        </section>
      )}
    </div>
  );
}

const card = {
  background: "#f9f9f9",
  border: "1px solid #e0e0e0",
  borderRadius: 8,
  padding: "16px 20px",
  marginBottom: 16,
};
const errorStyle  = { color: "red" };
const labelStyle  = { display: "block", fontSize: 13, fontWeight: 600, marginTop: 10, marginBottom: 4 };
const inputStyle  = { width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", boxSizing: "border-box" };
const btnStyle    = { marginTop: 14, padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 };