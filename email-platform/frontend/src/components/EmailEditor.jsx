import { useEffect, useRef, useState } from "react";

const API = (
  import.meta.env.VITE_API_BASE_URL ||
  ((typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
    ? "http://127.0.0.1:8000"
    : "https://rainbowdashhackathon-production.up.railway.app")
).replace(/\/$/, "");

const FALLBACK_TEMPLATES = [
  "bold", "dark", "earthy", "new-message", "gradient",
  "newsletter", "paper", "neon", "blob", "forest", "retro", "minimal", "blue-min",
];

const C = {
  primary: "#4f46e5",
  primarySoft: "#edf1ff",
  border: "#d7deea",
  borderSoft: "#e6ebf3",
  canvas: "#eceff9",
  white: "#ffffff",
  ink: "#141b2f",
  inkSoft: "#8593af",
  inkMid: "#4f5f7e",
  danger: "#d14343",
  success: "#166534",
  successBg: "#f0fdf4",
  successBorder: "#92d7a0",
  mutedButton: "#c6d1df",
};

const STEPS = [
  { id: 1, label: "Compose Email and Template Preview" },
  { id: 2, label: "Upload Contacts" },
  { id: 3, label: "Summary and Send" },
];

function toLabel(value) {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map(chunk => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join("-");
}

function Field({ label, hint, required, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{
          fontSize: 12, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.06em", color: C.inkMid,
        }}>
          {label}
          {required && <span style={{ color: C.danger, marginLeft: 4 }}>*</span>}
        </label>
        {hint && <span style={{ fontSize: 12, color: C.inkSoft }}>{hint}</span>}
      </div>
      {children}
      {error && <span style={{ fontSize: 12, color: C.danger }}>{error}</span>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", hasError = false }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%", borderRadius: 10,
        border: `1px solid ${hasError ? "#efb3b3" : focused ? "#a7b0ff" : C.border}`,
        padding: "12px 14px", fontSize: 15, color: C.ink, outline: "none",
        background: C.white,
        boxShadow: focused ? "0 0 0 3px rgba(79,70,229,0.12)" : "none",
        transition: "all 0.15s ease",
      }}
    />
  );
}

function Stepper({ activeStep }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", minWidth: 500 }}>
      {STEPS.map((step, index) => {
        const isActive = step.id === activeStep;
        const isDone = step.id < activeStep;
        const circleBg = isActive ? C.primary : isDone ? C.primarySoft : "#eef2f8";
        const circleColor = isActive ? "#ffffff" : isDone ? C.primary : "#9aa8be";
        return (
          <div key={step.id} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ minWidth: 170, textAlign: "center" }}>
              <div style={{
                width: 42, height: 42, margin: "0 auto 4px", borderRadius: "50%",
                border: `2px solid ${isActive ? "#cfd4ff" : "transparent"}`,
                background: circleBg, color: circleColor,
                fontSize: "clamp(10px, 0.8vw, 13px)", fontWeight: 800,
                display: "grid", placeItems: "center",
                boxShadow: isActive ? "0 4px 10px rgba(79,70,229,0.22)" : "none",
              }}>
                {String(step.id).padStart(2, "0")}
              </div>
              <div style={{ fontSize: "clamp(10px, 0.8vw, 13px)", fontWeight: 700, color: isActive ? C.primary : "#7c8da9", lineHeight: 1.1 }}>
                {step.label}
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div style={{ width: 80, height: 2, borderRadius: 999, background: "#dce3f0", marginBottom: 30 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function cardStyle() {
  return { background: C.white, border: `1px solid ${C.border}`, borderRadius: 22, overflow: "hidden" };
}

// ── Send Result Modal ────────────────────────────────────────────────────────

function SendResultModal({ result, onClose }) {
  if (!result) return null;
  const hasErrors = result.error_count > 0;
  const totalAttempted = (result.sent_count || 0) + (result.error_count || 0);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(20,27,47,0.55)", backdropFilter: "blur(4px)",
      display: "grid", placeItems: "center", padding: 20,
    }}>
      <div style={{
        background: C.white, borderRadius: 24, width: "100%", maxWidth: 520,
        boxShadow: "0 24px 60px rgba(20,27,47,0.22)",
        overflow: "hidden", animation: "modalPop 0.22s ease",
      }}>
        <style>{`@keyframes modalPop { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>

        {/* Header */}
        <div style={{
          padding: "28px 32px 20px",
          borderBottom: `1px solid ${C.border}`,
          textAlign: "center",
        }}>
          <div style={{
            fontSize: 56, lineHeight: 1,
            color: result.error && !result.sent_count ? C.danger : C.success,
          }}>
            {result.error && !result.sent_count ? "✕" : "✓"}
          </div>
          <div style={{ marginTop: 10, fontSize: 22, fontWeight: 800, color: C.ink }}>
            {result.error && !result.sent_count
              ? "Send Failed"
              : hasErrors
                ? "Campaign Sent with Errors"
                : "Campaign Sent!"}
          </div>
          {result.error && !result.sent_count
            ? <div style={{ marginTop: 6, fontSize: 14, color: C.danger }}>{result.error}</div>
            : (
              <div style={{ marginTop: 8, fontSize: 15, color: C.inkMid }}>
                <strong style={{ color: C.ink }}>{result.sent_count}</strong> of{" "}
                <strong style={{ color: C.ink }}>{totalAttempted}</strong> emails delivered
              </div>
            )
          }
        </div>

        {/* Stats row */}
        {!result.error && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: C.border }}>
            {[
              { label: "Delivered", value: result.sent_count || 0, color: C.success, bg: C.successBg },
              { label: "Failed", value: result.error_count || 0, color: C.danger, bg: "#fff5f5" },
            ].map(stat => (
              <div key={stat.label} style={{
                background: stat.bg, padding: "18px 24px", textAlign: "center",
              }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: stat.color, lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.inkSoft, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Per-email error details */}
        {hasErrors && result.errors?.length > 0 && (
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.inkMid, marginBottom: 8 }}>
              Failed Addresses
            </div>
            <div style={{ maxHeight: 160, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {result.errors.map((e, i) => (
                <div key={i} style={{
                  background: "#fff5f5", border: "1px solid #fca5a5",
                  borderRadius: 8, padding: "8px 12px", fontSize: 13,
                }}>
                  <span style={{ fontWeight: 700, color: C.danger }}>{e.email}</span>
                  {e.error && <span style={{ color: C.inkSoft, marginLeft: 8 }}>— {e.error}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sent list (collapsed by default, only show if no errors or small list) */}
        {!hasErrors && result.sent?.length > 0 && result.sent.length <= 8 && (
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.inkMid, marginBottom: 8 }}>
              Delivered To
            </div>
            <div style={{ maxHeight: 140, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
              {result.sent.map((email, i) => (
                <div key={i} style={{ fontSize: 13, color: C.inkMid, padding: "4px 0", borderBottom: `1px solid ${C.borderSoft}` }}>
                  {email}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close button */}
        <div style={{ padding: "20px 32px", borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none", borderRadius: 12,
              background: C.primary, color: "#fff",
              fontSize: 15, fontWeight: 700,
              padding: "12px 40px", cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function EmailEditor() {
  const [subject, setSubject] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [header, setHeader] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [replyTo, setReplyTo] = useState("");

  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [previewIndex, setPreviewIndex] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState("dark");
  const [previewKey, setPreviewKey] = useState(0);
  const [deviceMode, setDeviceMode] = useState("desktop");

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [recipients, setRecipients] = useState([]);

  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [bodyFocused, setBodyFocused] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === "undefined" ? 1440 : window.innerWidth));

  const previewTimer = useRef(null);
  const fileInputRef = useRef(null);
  const summarySectionRef = useRef(null);

  const templateOptions = templates.length > 0 ? templates : FALLBACK_TEMPLATES;
  const hasRecipients = recipients.length > 0;
  const composeReady = Boolean(subject.trim() && body.trim() && selectedTemplate);
  const activeStep = !composeReady ? 1 : !hasRecipients ? 2 : 3;
  const uploadCompleted = Boolean(uploadStatus && !uploadStatus.loading && !uploadStatus.error);
  const canUpload = Boolean(selectedFile && !uploadStatus?.loading && !uploadCompleted);
  const selectedTemplateLabel = toLabel(selectedTemplate || "not-set");
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const uploadInvalidCount = Number(uploadStatus?.invalid_count || 0);
  const uploadDuplicateCount = Number(uploadStatus?.duplicate_count || 0);
  const uploadErrorCount = uploadInvalidCount + uploadDuplicateCount;
  const uploadHasDataIssues = uploadErrorCount > 0;
  const csvReadyToSend = Boolean(uploadCompleted && !uploadHasDataIssues && hasRecipients);
  const canSend = Boolean(csvReadyToSend && composeReady && !sending);
  const singleColumn = viewportWidth < 1080;

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setLoadingTemplates(true);
    fetch(`${API}/templates`)
      .then(async res => {
        if (!res.ok) throw new Error("Unable to fetch template list.");
        return res.json();
      })
      .then(data => {
        const list = Array.isArray(data.templates) ? data.templates : [];
        if (list.length > 0) {
          const defaultIndex = Math.max(0, list.findIndex(n => n.toLowerCase() === "dark"));
          setTemplates(list);
          setPreviewIndex(defaultIndex);
          setSelectedTemplate(list[defaultIndex]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTemplates(false));
  }, []);

  useEffect(() => {
    clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => setPreviewKey(c => c + 1), 350);
    return () => clearTimeout(previewTimer.current);
  }, [subject, businessName, header, body, website, selectedTemplate]);

  function buildPreviewUrl(templateName) {
    if (!templateName || !templates.includes(templateName)) return null;
    const query = new URLSearchParams({
      name: "[Name]",
      subject: subject.trim() || "Your Subject Line",
      header: header.trim() || "Your headline here",
      body: body.trim() || "Your email body will appear here.",
      business_name: businessName.trim() || "Your Business",
      website: website.trim() || "https://yourwebsite.com",
    });
    return `${API}/preview/${templateName}?${query.toString()}`;
  }

  function handleSelectTemplate(index) {
    const next = templateOptions[index];
    if (!next) return;
    setPreviewIndex(index);
    setSelectedTemplate(next);
  }

  function openFilePicker() {
    if (fileInputRef.current) fileInputRef.current.click();
  }

  function handleFileSelected(file) {
    if (!file) return;
    setSelectedFile(file);
    setUploadStatus(null);
    setRecipients([]);
    setSendResult(null);
  }

  function handleFileInput(e) { handleFileSelected(e.target.files?.[0]); }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    handleFileSelected(e.dataTransfer.files?.[0]);
  }

  async function handleUploadContacts() {
    if (!selectedFile) return;
    setUploadStatus({ loading: true });
    setRecipients([]);
    setSendResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch(`${API}/upload-contacts`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed.");
      setRecipients(Array.isArray(data.recipients) ? data.recipients : []);
      setUploadStatus(data);
    } catch (err) {
      setUploadStatus({ error: err.message || "Upload failed." });
    }
  }

  function handleCancelUpload() {
    setSelectedFile(null);
    setUploadStatus(null);
    setRecipients([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSendCampaign() {
    setShowErrors(true);
    if (!canSend) return;

    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch(`${API}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Always send upload_id so backend uses the authoritative cached list
          upload_id: uploadStatus?.upload_id || "",
          // Also send recipients as fallback in case cache expired
          recipients: recipients,
          template_name: selectedTemplate,
          subject: subject.trim() || "Your Subject Line",
          header: header.trim() || subject.trim() || "Your headline here",
          body: body.trim() || "Your email body will appear here.",
          business_name: businessName.trim() || "",
          website: website.trim() || "",
          reply_to: replyTo.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Surface HTTP-level errors (400/500) as a sendResult error
        setSendResult({ error: data.detail || `Server error ${res.status}`, sent_count: 0, error_count: 0 });
      } else {
        setSendResult(data);
      }

      setShowModal(true);
    } catch (err) {
      setSendResult({ error: err.message || "Send failed.", sent_count: 0, error_count: 0 });
      setShowModal(true);
    } finally {
      setSending(false);
    }
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const previewUrl = buildPreviewUrl(selectedTemplate);

  return (
    <div style={{ minHeight: "100vh", background: C.canvas, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* Send result modal */}
      {showModal && sendResult && (
        <SendResultModal result={sendResult} onClose={() => setShowModal(false)} />
      )}

      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "rgba(255,255,255,0.95)", borderBottom: `1px solid ${C.border}`,
        backdropFilter: "blur(6px)",
        padding: singleColumn ? "6px 10px" : "6px 20px",
        display: "flex", flexDirection: singleColumn ? "column" : "row",
        alignItems: singleColumn ? "stretch" : "center", gap: singleColumn ? 6 : 10,
      }}>
        <div style={{ minWidth: singleColumn ? 0 : 360 }}>
          <div style={{ fontSize: "clamp(8px, 0.55vw, 10px)", lineHeight: 1, letterSpacing: "0.08em", fontWeight: 700, color: "#93a0ba", textTransform: "uppercase" }}>
            Campaign Builder
          </div>
          <div style={{ fontSize: "clamp(14px, 1.05vw, 20px)", lineHeight: 0.95, fontWeight: 800, color: C.ink }}>
            Create New Campaign
          </div>
        </div>

        {!singleColumn && <Stepper activeStep={activeStep} />}

        <button
          type="button"
          onClick={() => summarySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          disabled={!canSend}
          style={{
            border: "none", borderRadius: 10,
            alignSelf: singleColumn ? "flex-end" : "auto",
            padding: singleColumn ? "7px 12px" : "8px 16px",
            fontWeight: 700, fontSize: "clamp(11px, 0.95vw, 15px)",
            color: "#ffffff",
            background: canSend ? C.primary : C.mutedButton,
            cursor: canSend ? "pointer" : "not-allowed",
          }}
        >
          Complete
        </button>
      </header>

      <main style={{ maxWidth: 1600, margin: "18px auto 40px", padding: singleColumn ? "0 12px 24px" : "0 28px 32px" }}>

        {/* ── Step 1: Compose ── */}
        <section style={cardStyle()}>
          <div style={{ display: "grid", gridTemplateColumns: singleColumn ? "1fr" : "1fr 1fr" }}>

            {/* Left: fields */}
            <div style={{ borderRight: singleColumn ? "none" : `1px solid ${C.border}`, borderBottom: singleColumn ? `1px solid ${C.border}` : "none" }}>
              <div style={{ padding: "24px 28px", display: "grid", gap: 16 }}>
                <Field label="Subject" required error={showErrors && !subject.trim() ? "Subject is required." : null}>
                  <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Big update from our team" hasError={showErrors && !subject.trim()} />
                </Field>
                <Field label="Business Name">
                  <Input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Acme Co." />
                </Field>
                <Field label="Header">
                  <Input value={header} onChange={e => setHeader(e.target.value)} placeholder="e.g. Great news for you" />
                </Field>
                <Field label="Body" required hint={`${wordCount} words`} error={showErrors && !body.trim() ? "Body is required." : null}>
                  <textarea
                    rows={8}
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    onFocus={() => setBodyFocused(true)}
                    onBlur={() => setBodyFocused(false)}
                    placeholder="Write your campaign message..."
                    style={{
                      width: "100%", borderRadius: 10,
                      border: `1px solid ${showErrors && !body.trim() ? "#efb3b3" : bodyFocused ? "#a7b0ff" : C.border}`,
                      padding: "12px 14px", fontSize: 15, lineHeight: 1.6,
                      resize: "vertical", outline: "none",
                      boxShadow: bodyFocused ? "0 0 0 3px rgba(79,70,229,0.12)" : "none",
                    }}
                  />
                </Field>
                <Field label="Website">
                  <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="e.g. https://acme.com" />
                </Field>
                <Field label="Reply-To Email" hint="Replies from recipients will go here.">
                  <Input value={replyTo} onChange={e => setReplyTo(e.target.value)} placeholder="e.g. hello@acme.com" type="email" />
                </Field>
              </div>
            </div>

            {/* Right: preview */}
            <div style={{ background: "#f7f9ff", padding: "24px 28px", display: "grid", gap: 14 }}>
              <div style={{ minHeight: 430, borderRadius: 14, background: "#0e1018", boxShadow: "0 2px 8px rgba(139,92,246,0.12)", padding: 4 }}>
                <div style={{
                  width: deviceMode === "mobile" ? 300 : "100%",
                  height: 404, margin: "0 auto", borderRadius: 10,
                  overflow: "hidden", border: "0.5px solid rgba(139,92,246,0.28)", background: "#ffffff",
                }}>
                  {loadingTemplates ? (
                    <div style={{ display: "grid", placeItems: "center", height: "100%", color: C.inkSoft, fontSize: 18 }}>Loading templates...</div>
                  ) : previewUrl ? (
                    <iframe
                      key={`${selectedTemplate}-${previewKey}-${deviceMode}`}
                      title={`preview-${selectedTemplate}`}
                      src={previewUrl}
                      style={{ width: "100%", height: "100%", border: "none" }}
                    />
                  ) : (
                    <div style={{ display: "grid", placeItems: "center", height: "100%", color: C.inkSoft, textAlign: "center", padding: 24 }}>
                      <div>
                        <div style={{ fontSize: "clamp(10px, 0.8vw, 13px)", fontWeight: 700, color: C.ink }}>{selectedTemplateLabel}</div>
                        <div style={{ marginTop: 8, fontSize: "clamp(12px, 0.85vw, 15px)" }}>Template preview unavailable until backend loads.</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {templateOptions.map((name, index) => {
                  const selected = name === selectedTemplate;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleSelectTemplate(index)}
                      style={{
                        border: `1px solid ${selected ? "#6667f1" : C.border}`,
                        background: selected ? "#eceeff" : "#f9fbff",
                        borderRadius: 14, minWidth: 128, flex: "1 1 128px",
                        textAlign: "left", padding: "10px 14px", fontSize: 15,
                        color: selected ? "#2f3ee6" : C.ink, fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      <span style={{ color: selected ? "#4f46e5" : "#d4dbe6", marginRight: 8 }}>●</span>
                      {toLabel(name)}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ display: "inline-flex", gap: 4, border: `1px solid ${C.border}`, borderRadius: 14, padding: 4, background: C.white }}>
                  {["desktop", "mobile"].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setDeviceMode(mode)}
                      style={{
                        border: "none", borderRadius: 10, padding: "10px 26px",
                        fontWeight: 700, fontSize: "clamp(10px, 0.8vw, 13px)",
                        textTransform: "capitalize",
                        color: deviceMode === mode ? "#ffffff" : C.inkMid,
                        background: deviceMode === mode ? C.primary : "transparent",
                        cursor: "pointer",
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, padding: "16px 30px", fontSize: "clamp(13px, 0.9vw, 17px)", color: C.inkSoft, fontWeight: 500 }}>
            Compose and preview are ready. Upload contacts in the next section.
          </div>
        </section>

        {/* ── Step 2: Upload Contacts ── */}
        <section style={{ ...cardStyle(), marginTop: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: singleColumn ? "1fr" : "1fr 1fr" }}>

            {/* Left: uploader */}
            <div style={{ borderRight: singleColumn ? "none" : `1px solid ${C.border}`, borderBottom: singleColumn ? `1px solid ${C.border}` : "none" }}>
              <div style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 32px 14px" }}>
                <div style={{ fontSize: "clamp(20px, 1.6vw, 34px)", color: C.ink, fontWeight: 800, lineHeight: 1.08 }}>Upload Contacts</div>
                <div style={{ fontSize: "clamp(13px, 1.1vw, 22px)", lineHeight: 1.25, color: C.inkSoft, marginTop: 8 }}>
                  Upload a CSV with name and email columns.<br />Only one file can be uploaded at a time.
                </div>
              </div>

              <div style={{ padding: 24, minHeight: singleColumn ? 360 : 470, display: "flex", flexDirection: "column", gap: 16 }}>
                <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileInput} style={{ display: "none" }} />

                <div
                  onClick={!selectedFile ? openFilePicker : undefined}
                  onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  role={!selectedFile ? "button" : undefined}
                  tabIndex={!selectedFile ? 0 : undefined}
                  onKeyDown={e => { if (!selectedFile && (e.key === "Enter" || e.key === " ")) openFilePicker(); }}
                  style={{
                    border: `2px dashed ${dragActive ? "#8996ff" : selectedFile ? C.primary : "#d9e0ec"}`,
                    borderRadius: 18, minHeight: singleColumn ? 180 : 260,
                    display: "grid", placeItems: "center", textAlign: "center",
                    background: dragActive ? "#f2f4ff" : selectedFile ? "#f5f6ff" : "transparent",
                    cursor: !selectedFile ? "pointer" : "default",
                    transition: "all 0.2s ease",
                  }}
                >
                  {selectedFile ? (
                    <div style={{ width: "100%", padding: "0 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 14, background: "#e9edff", display: "grid", placeItems: "center", color: C.primary }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div style={{ width: "100%", maxWidth: 420, display: "flex", alignItems: "center", gap: 12, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px" }}>
                        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                          <div style={{ fontSize: "clamp(13px, 1vw, 16px)", fontWeight: 700, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {selectedFile.name}
                          </div>
                          <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>{formatFileSize(selectedFile.size)}</div>
                        </div>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); handleCancelUpload(); }}
                          title="Remove file"
                          style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.border}`, background: C.white, color: C.inkSoft, display: "grid", placeItems: "center", cursor: "pointer", transition: "all 0.15s ease" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.borderColor = "#fca5a5"; e.currentTarget.style.color = C.danger; }}
                          onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.inkSoft; }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                      <div style={{ fontSize: "clamp(12px, 0.85vw, 14px)", color: C.inkSoft }}>Drop a new file here to replace, or click × to remove</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ width: 50, height: 50, margin: "0 auto 14px", borderRadius: "50%", background: "#e9edff", color: C.primary, display: "grid", placeItems: "center" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M12 16V8M12 8L9 11M12 8l3 3M5 16.5c0 1.1.9 2 2 2h10a2 2 0 0 0 2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div style={{ fontSize: "clamp(16px, 1.3vw, 30px)", fontWeight: 800, color: C.ink }}>
                        Drag and Drop or <span style={{ color: C.primary }}>Browse to Upload</span>
                      </div>
                      <div style={{ marginTop: 10, color: C.inkSoft, fontSize: "clamp(13px, 1vw, 20px)" }}>
                        Supported formats: <strong>csv</strong>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={openFilePicker}
                  style={{ border: "none", background: "transparent", color: C.primary, fontSize: "clamp(13px, 1.1vw, 22px)", fontWeight: 700, textAlign: "left", padding: 0, cursor: "pointer" }}
                >
                  i Download sample data for file upload
                </button>

                {uploadStatus?.error && <div style={{ color: C.danger, fontSize: "clamp(10px, 0.8vw, 13px)" }}>{uploadStatus.error}</div>}

                <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end", gap: 14 }}>
                  <button
                    type="button"
                    onClick={handleCancelUpload}
                    style={{ borderRadius: 14, border: `1px solid ${C.border}`, background: C.white, color: C.inkMid, fontSize: "clamp(14px, 1.2vw, 24px)", fontWeight: 700, padding: "10px 34px", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadContacts}
                    disabled={!canUpload}
                    style={{
                      borderRadius: 14, border: "none",
                      background: canUpload ? C.primary : uploadCompleted ? "#b7c3d6" : C.mutedButton,
                      color: "#ffffff", fontSize: "clamp(14px, 1.2vw, 24px)", fontWeight: 800,
                      padding: "10px 34px", cursor: canUpload ? "pointer" : "not-allowed",
                      filter: uploadCompleted ? "blur(0.7px)" : "none",
                      opacity: uploadCompleted ? 0.9 : 1,
                    }}
                  >
                    {uploadStatus?.loading ? "Uploading..." : uploadCompleted ? "Uploaded ✓" : "Upload"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: validation results */}
            <div>
              <div style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 32px 14px" }}>
                <div style={{ fontSize: "clamp(20px, 1.6vw, 34px)", color: C.ink, fontWeight: 800, lineHeight: 1.08 }}>CSV Error Check</div>
                <div style={{ fontSize: "clamp(13px, 1.1vw, 22px)", lineHeight: 1.25, color: C.inkSoft, marginTop: 8 }}>Status after contact file upload.</div>
              </div>

              <div style={{ minHeight: singleColumn ? 360 : 470, padding: "24px 20px", display: "grid", placeItems: "center" }}>
                {uploadStatus?.loading ? (
                  <div style={{ width: "80%", maxWidth: 620, minHeight: 90, border: `2px dashed ${C.borderSoft}`, borderRadius: 18, display: "grid", placeItems: "center", color: C.inkSoft, fontSize: "clamp(13px, 1vw, 18px)", textAlign: "center", padding: "10px 16px" }}>
                    Checking uploaded file...
                  </div>
                ) : uploadStatus?.error ? (
                  <div style={{ width: "80%", maxWidth: 620, border: "1px solid #f4b4b4", borderRadius: 18, padding: 20, background: "#fff5f5", color: "#b42318", textAlign: "center" }}>
                    <div style={{ fontSize: "clamp(42px, 4vw, 68px)", fontWeight: 900, lineHeight: 1 }}>✕</div>
                    <div style={{ fontSize: "clamp(14px, 1vw, 18px)", fontWeight: 800, marginTop: 4 }}>Upload failed</div>
                    <div style={{ fontSize: "clamp(12px, 0.9vw, 15px)", lineHeight: 1.4, marginTop: 8 }}>{uploadStatus.error}</div>
                  </div>
                ) : uploadStatus ? (
                  uploadHasDataIssues ? (
                    <div style={{ width: "80%", maxWidth: 620, border: "1px solid #f4b4b4", borderRadius: 18, padding: 20, background: "#fff5f5", color: "#b42318", textAlign: "center" }}>
                      <div style={{ fontSize: "clamp(38px, 3.2vw, 56px)", fontWeight: 900, lineHeight: 1 }}>✕</div>
                      <div style={{ fontSize: "clamp(14px, 1vw, 18px)", fontWeight: 800, marginTop: 4 }}>
                        {uploadErrorCount} error{uploadErrorCount !== 1 ? "s" : ""} found
                      </div>
                      <div style={{ marginTop: 10, display: "inline-block", textAlign: "left", fontSize: "clamp(12px, 0.9vw, 15px)", lineHeight: 1.5 }}>
                        <div>Invalid rows: <strong>{uploadInvalidCount}</strong></div>
                        <div>Duplicate rows: <strong>{uploadDuplicateCount}</strong></div>
                        <div>Valid contacts: <strong>{uploadStatus.valid_count || 0}</strong></div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: "80%", maxWidth: 620, border: `1px solid ${C.successBorder}`, borderRadius: 18, padding: 20, background: C.successBg, color: C.success, textAlign: "center" }}>
                      <div style={{ fontSize: "clamp(78px, 9vw, 148px)", fontWeight: 900, lineHeight: 0.9 }}>✓</div>
                      <div style={{ fontSize: "clamp(14px, 1vw, 18px)", fontWeight: 800, marginTop: 4 }}>0 errors found</div>
                      <div style={{ fontSize: "clamp(12px, 0.9vw, 15px)", lineHeight: 1.5, marginTop: 10 }}>
                        <div>File passed validation and is ready to send.</div>
                        <div>Valid contacts: <strong>{uploadStatus.valid_count || 0}</strong></div>
                      </div>
                    </div>
                  )
                ) : (
                  <div style={{ width: "80%", maxWidth: 620, minHeight: 90, border: `2px dashed ${C.borderSoft}`, borderRadius: 18, display: "grid", placeItems: "center", color: C.inkSoft, fontSize: "clamp(13px, 1.1vw, 22px)", textAlign: "center", padding: "10px 16px" }}>
                    Upload a contact file to run error checks.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Step 3: Summary & Send ── */}
        <section ref={summarySectionRef} style={{ ...cardStyle(), marginTop: 20 }}>
          <div style={{ textAlign: "center", borderBottom: `1px solid ${C.border}`, padding: "16px 20px" }}>
            <div style={{ fontSize: "clamp(22px, 1.8vw, 38px)", fontWeight: 800, color: C.ink, lineHeight: 1.08 }}>Summary and Send</div>
            <div style={{ marginTop: 4, fontSize: "clamp(13px, 1vw, 21px)", color: C.inkSoft }}>Review details and send campaign.</div>
          </div>

          <div style={{ textAlign: "center", padding: "28px 20px 34px" }}>
            <div style={{ fontSize: "clamp(16px, 1.3vw, 30px)", lineHeight: 1.55, color: C.inkMid }}>
              <div>Sent To: <strong style={{ color: C.ink }}>{recipients.length} contacts</strong></div>
              <div>Template: <strong style={{ color: C.ink }}>{selectedTemplateLabel}</strong></div>
              <div>Subject: <strong style={{ color: C.ink }}>{subject.trim() || "Not set"}</strong></div>
              {replyTo.trim() && <div>Reply-To: <strong style={{ color: C.ink }}>{replyTo.trim()}</strong></div>}
            </div>

            {/* Readiness checklist */}
            <div style={{ marginTop: 18, display: "inline-flex", flexDirection: "column", gap: 6, textAlign: "left", fontSize: 14, color: C.inkMid }}>
              {[
                { label: "Subject written", ok: Boolean(subject.trim()) },
                { label: "Body written", ok: Boolean(body.trim()) },
                { label: "Template selected", ok: Boolean(selectedTemplate) },
                { label: "Contacts uploaded & validated", ok: csvReadyToSend },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                    background: item.ok ? C.successBg : "#fff5f5",
                    border: `1px solid ${item.ok ? C.successBorder : "#fca5a5"}`,
                    color: item.ok ? C.success : C.danger,
                    display: "grid", placeItems: "center", fontSize: 10, fontWeight: 900,
                  }}>
                    {item.ok ? "✓" : "✕"}
                  </span>
                  <span style={{ color: item.ok ? C.inkMid : C.danger }}>{item.label}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <button
                type="button"
                onClick={handleSendCampaign}
                disabled={!canSend}
                style={{
                  border: "none", borderRadius: 16,
                  background: canSend ? C.primary : C.mutedButton,
                  color: "#fff", fontSize: "clamp(15px, 1.2vw, 24px)",
                  fontWeight: 800, padding: "14px 44px",
                  cursor: canSend ? "pointer" : "not-allowed",
                  transition: "opacity 0.15s ease",
                  opacity: sending ? 0.75 : 1,
                }}
              >
                {sending ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg style={{ animation: "spin 0.8s linear infinite" }} width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
                    </svg>
                    Sending {recipients.length} emails…
                  </span>
                ) : (
                  `Send Campaign → ${recipients.length} recipient${recipients.length !== 1 ? "s" : ""}`
                )}
              </button>
            </div>

            {showErrors && !composeReady && (
              <div style={{ marginTop: 12, color: C.danger, fontSize: 14 }}>
                Please fill in subject and body before sending.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}