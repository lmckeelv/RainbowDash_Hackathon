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
      {/* Upload */}
      <section style={card}>
        <input type="file" accept=".csv,.txt" onChange={handleFileChange} />

        {status?.error && <p style={errorStyle}>{status.error}</p>}

        {status && !status.error && (
          <div style={{ marginTop: 12 }}>
            <p>
            {status.valid_count} valid recipient{status.valid_count !== 1 ? "s" : ""}... 
            {status.duplicate_count} duplicate{status.duplicate_count !== 1 ? "s" : ""} removed... 
            {status.invalid_count} invalid email{status.invalid_count !== 1 ? "s" : ""} skipped...
            </p>
          </div>
        )}
      </section>

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