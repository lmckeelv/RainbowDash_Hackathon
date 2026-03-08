import { useEffect, useRef, useState } from "react";

const API = "https://rainbowdashhackathon-production.up.railway.app";

const FALLBACK_TEMPLATES = [
  "bold",
  "dark",
  "earthy",
  "new-message",
  "gradient",
  "newsletter",
  "paper",
  "neon",
  "blob",
  "forest",
  "retro",
  "minimal",
  "blue-min",
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
        <label
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: C.inkMid,
          }}
        >
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
        width: "100%",
        borderRadius: 10,
        border: `1px solid ${hasError ? "#efb3b3" : focused ? "#a7b0ff" : C.border}`,
        padding: "12px 14px",
        fontSize: 15,
        color: C.ink,
        outline: "none",
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
              <div
                style={{
                  width: 42,
                  height: 42,
                  margin: "0 auto 4px",
                  borderRadius: "50%",
                  border: `2px solid ${isActive ? "#cfd4ff" : "transparent"}`,
                  background: circleBg,
                  color: circleColor,
                  fontSize: "clamp(10px, 0.8vw, 13px)",
                  fontWeight: 800,
                  display: "grid",
                  placeItems: "center",
                  boxShadow: isActive ? "0 4px 10px rgba(79,70,229,0.22)" : "none",
                }}
              >
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
  return {
    background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 22,
    overflow: "hidden",
  };
}

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
  const [showErrors, setShowErrors] = useState(false);
  const [bodyFocused, setBodyFocused] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === "undefined" ? 1440 : window.innerWidth));

  const previewTimer = useRef(null);
  const fileInputRef = useRef(null);

  const templateOptions = templates.length > 0 ? templates : FALLBACK_TEMPLATES;
  const hasRecipients = recipients.length > 0;
  const composeReady = Boolean(subject.trim() && body.trim() && selectedTemplate);
  const activeStep = !composeReady ? 1 : !hasRecipients ? 2 : 3;
  const uploadCompleted = Boolean(uploadStatus && !uploadStatus.loading && !uploadStatus.error);
  const canUpload = Boolean(selectedFile && !uploadStatus?.loading && !uploadCompleted);
  const canSend = Boolean(hasRecipients && composeReady && !sending);
  const selectedTemplateLabel = toLabel(selectedTemplate || "not-set");
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const uploadInvalidCount = Number(uploadStatus?.invalid_count || 0);
  const uploadDuplicateCount = Number(uploadStatus?.duplicate_count || 0);
  const uploadErrorCount = uploadInvalidCount + uploadDuplicateCount;
  const uploadHasDataIssues = uploadErrorCount > 0;
  const singleColumn = viewportWidth < 1080;

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setLoadingTemplates(true);
    fetch(`${API}/templates`)
      .then(async response => {
        if (!response.ok) {
          throw new Error("Unable to fetch template list.");
        }
        return response.json();
      })
      .then(data => {
        const list = Array.isArray(data.templates) ? data.templates : [];
        if (list.length > 0) {
          const defaultIndex = Math.max(
            0,
            list.findIndex(name => name.toLowerCase() === "dark"),
          );
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
    previewTimer.current = setTimeout(() => setPreviewKey(current => current + 1), 350);
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

  function handleFileInput(event) {
    handleFileSelected(event.target.files?.[0]);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);
    handleFileSelected(event.dataTransfer.files?.[0]);
  }

  async function handleUploadContacts() {
    if (!selectedFile) return;
    setUploadStatus({ loading: true });
    setRecipients([]);
    setSendResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${API}/upload-contacts`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Upload failed.");
      }
      setRecipients(Array.isArray(data.recipients) ? data.recipients : []);
      setUploadStatus(data);
    } catch (error) {
      setUploadStatus({ error: error.message || "Upload failed." });
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
      const response = await fetch(`${API}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients,
          template_name: selectedTemplate,
          subject: subject.trim(),
          header: header.trim(),
          body: body.trim(),
          business_name: businessName.trim(),
          website: website.trim(),
          reply_to: replyTo.trim(),
        }),
      });

      const data = await response.json();
      setSendResult(data);
    } catch (error) {
      setSendResult({ error: error.message || "Send failed." });
    } finally {
      setSending(false);
    }
  }

  const previewUrl = buildPreviewUrl(selectedTemplate);

  // Helper to format file size
  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.canvas,
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(255,255,255,0.95)",
          borderBottom: `1px solid ${C.border}`,
          backdropFilter: "blur(6px)",
          padding: singleColumn ? "6px 10px" : "6px 20px",
          display: "flex",
          flexDirection: singleColumn ? "column" : "row",
          alignItems: singleColumn ? "stretch" : "center",
          gap: singleColumn ? 6 : 10,
        }}
      >
        <div style={{ minWidth: singleColumn ? 0 : 360 }}>
          <div style={{ fontSize: "clamp(8px, 0.55vw, 10px)", lineHeight: 1, letterSpacing: "0.08em", fontWeight: 700, color: "#93a0ba", textTransform: "uppercase" }}>
            Campaign Builder
          </div>
          <div style={{ fontSize: "clamp(14px, 1.05vw, 20px)", lineHeight: 0.95, fontWeight: 800, color: C.ink }}>Create New Campaign</div>
        </div>

        {!singleColumn && <Stepper activeStep={activeStep} />}

        <button
          type="button"
          onClick={handleSendCampaign}
          disabled={!canSend}
          style={{
            border: "none",
            borderRadius: 10,
            alignSelf: singleColumn ? "flex-end" : "auto",
            padding: singleColumn ? "7px 12px" : "8px 16px",
            fontWeight: 700,
            fontSize: "clamp(11px, 0.95vw, 15px)",
            color: "#ffffff",
            background: canSend ? C.primary : C.mutedButton,
            cursor: canSend ? "pointer" : "not-allowed",
          }}
        >
          Send
        </button>
      </header>

      <main style={{ maxWidth: 1600, margin: "18px auto 40px", padding: singleColumn ? "0 12px 24px" : "0 28px 32px" }}>
        <section style={cardStyle()}>
          <div style={{ display: "grid", gridTemplateColumns: singleColumn ? "1fr" : "1fr 1fr" }}>
            <div style={{ borderRight: singleColumn ? "none" : `1px solid ${C.border}`, borderBottom: singleColumn ? `1px solid ${C.border}` : "none" }}>
              <div style={{ padding: "24px 28px", display: "grid", gap: 16 }}>
                <Field label="Subject" required error={showErrors && !subject.trim() ? "Subject is required." : null}>
                  <Input
                    value={subject}
                    onChange={event => setSubject(event.target.value)}
                    placeholder="e.g. Big update from our team"
                    hasError={showErrors && !subject.trim()}
                  />
                </Field>

                <Field label="Business Name">
                  <Input value={businessName} onChange={event => setBusinessName(event.target.value)} placeholder="e.g. Acme Co." />
                </Field>

                <Field label="Header">
                  <Input value={header} onChange={event => setHeader(event.target.value)} placeholder="e.g. Great news for you" />
                </Field>

                <Field label="Body" required hint={`${wordCount} words`} error={showErrors && !body.trim() ? "Body is required." : null}>
                  <textarea
                    rows={8}
                    value={body}
                    onChange={event => setBody(event.target.value)}
                    onFocus={() => setBodyFocused(true)}
                    onBlur={() => setBodyFocused(false)}
                    placeholder="Write your campaign message..."
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      border: `1px solid ${showErrors && !body.trim() ? "#efb3b3" : bodyFocused ? "#a7b0ff" : C.border}`,
                      padding: "12px 14px",
                      fontSize: 15,
                      lineHeight: 1.6,
                      resize: "vertical",
                      outline: "none",
                      boxShadow: bodyFocused ? "0 0 0 3px rgba(79,70,229,0.12)" : "none",
                    }}
                  />
                </Field>

                <Field label="Website">
                  <Input value={website} onChange={event => setWebsite(event.target.value)} placeholder="e.g. https://acme.com" />
                </Field>

                <Field label="Reply-To Email" hint="Replies from recipients will go here.">
                  <Input value={replyTo} onChange={event => setReplyTo(event.target.value)} placeholder="e.g. hello@acme.com" type="email" />
                </Field>
              </div>
            </div>

            <div style={{ background: "#f7f9ff", padding: "24px 28px", display: "grid", gap: 14 }}>
              <div
                style={{
                  minHeight: 430,
                  borderRadius: 14,
                  background: "#0e1018",
                  boxShadow: "0 2px 8px rgba(139,92,246,0.12)",
                  padding: 4,
                }}
              >
                <div
                  style={{
                    width: deviceMode === "mobile" ? 300 : "100%",
                    height: 404,
                    margin: "0 auto",
                    borderRadius: 10,
                    overflow: "hidden",
                    border: "0.5px solid rgba(139,92,246,0.28)",
                    background: "#ffffff",
                  }}
                >
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
                        <div style={{ marginTop: 8, fontSize: "clamp(12px, 0.85vw, 15px)" }}>Template preview is unavailable until the backend template loads.</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {templateOptions.map((templateName, index) => {
                  const selected = templateName === selectedTemplate;
                  return (
                    <button
                      key={templateName}
                      type="button"
                      onClick={() => handleSelectTemplate(index)}
                      style={{
                        border: `1px solid ${selected ? "#6667f1" : C.border}`,
                        background: selected ? "#eceeff" : "#f9fbff",
                        borderRadius: 14,
                        minWidth: 128,
                        flex: "1 1 128px",
                        textAlign: "left",
                        padding: "10px 14px",
                        fontSize: 15,
                        color: selected ? "#2f3ee6" : C.ink,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ color: selected ? "#4f46e5" : "#d4dbe6", marginRight: 8 }}>●</span>
                      {toLabel(templateName)}
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
                        border: "none",
                        borderRadius: 10,
                        padding: "10px 26px",
                        fontWeight: 700,
                        fontSize: "clamp(10px, 0.8vw, 13px)",
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

        <section style={{ ...cardStyle(), marginTop: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: singleColumn ? "1fr" : "1fr 1fr" }}>
            <div style={{ borderRight: singleColumn ? "none" : `1px solid ${C.border}`, borderBottom: singleColumn ? `1px solid ${C.border}` : "none" }}>
              <div style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 32px 14px" }}>
                <div style={{ fontSize: "clamp(20px, 1.6vw, 34px)", color: C.ink, fontWeight: 800, lineHeight: 1.08 }}>Upload Contacts</div>
                <div style={{ fontSize: "clamp(13px, 1.1vw, 22px)", lineHeight: 1.25, color: C.inkSoft, marginTop: 8 }}>
                  Upload a CSV with name and email columns.
                  <br />
                  Only one file can be uploaded at a time.
                </div>
              </div>

              <div style={{ padding: 24, minHeight: singleColumn ? 360 : 470, display: "flex", flexDirection: "column", gap: 16 }}>
                <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileInput} style={{ display: "none" }} />

                {/* Drop zone: shows file card if selected, otherwise shows drag & drop UI */}
                <div
                  onClick={!selectedFile ? openFilePicker : undefined}
                  onDragEnter={event => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={event => {
                    event.preventDefault();
                    setDragActive(false);
                  }}
                  onDragOver={event => event.preventDefault()}
                  onDrop={handleDrop}
                  role={!selectedFile ? "button" : undefined}
                  tabIndex={!selectedFile ? 0 : undefined}
                  onKeyDown={event => {
                    if (!selectedFile && (event.key === "Enter" || event.key === " ")) openFilePicker();
                  }}
                  style={{
                    border: `2px dashed ${dragActive ? "#8996ff" : selectedFile ? C.primary : "#d9e0ec"}`,
                    borderRadius: 18,
                    minHeight: singleColumn ? 180 : 260,
                    display: "grid",
                    placeItems: "center",
                    textAlign: "center",
                    background: dragActive ? "#f2f4ff" : selectedFile ? "#f5f6ff" : "transparent",
                    cursor: !selectedFile ? "pointer" : "default",
                    transition: "all 0.2s ease",
                  }}
                >
                  {selectedFile ? (
                    // File selected state — show file card with remove button
                    <div style={{ width: "100%", padding: "0 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                      {/* File icon */}
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 14,
                          background: "#e9edff",
                          display: "grid",
                          placeItems: "center",
                          color: C.primary,
                        }}
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>

                      {/* File name + size row with X button */}
                      <div
                        style={{
                          width: "100%",
                          maxWidth: 420,
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          background: C.white,
                          border: `1px solid ${C.border}`,
                          borderRadius: 12,
                          padding: "10px 14px",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                          <div
                            style={{
                              fontSize: "clamp(13px, 1vw, 16px)",
                              fontWeight: 700,
                              color: C.ink,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {selectedFile.name}
                          </div>
                          <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>
                            {formatFileSize(selectedFile.size)}
                          </div>
                        </div>

                        {/* Remove / X button */}
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleCancelUpload();
                          }}
                          title="Remove file"
                          style={{
                            flexShrink: 0,
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            border: `1px solid ${C.border}`,
                            background: C.white,
                            color: C.inkSoft,
                            display: "grid",
                            placeItems: "center",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = "#fef2f2";
                            e.currentTarget.style.borderColor = "#fca5a5";
                            e.currentTarget.style.color = C.danger;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = C.white;
                            e.currentTarget.style.borderColor = C.border;
                            e.currentTarget.style.color = C.inkSoft;
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>

                      <div style={{ fontSize: "clamp(12px, 0.85vw, 14px)", color: C.inkSoft }}>
                        Drop a new file here to replace, or click × to remove
                      </div>
                    </div>
                  ) : (
                    // Empty state — drag & drop UI
                    <div>
                      <div
                        style={{
                          width: 50,
                          height: 50,
                          margin: "0 auto 14px",
                          borderRadius: "50%",
                          background: "#e9edff",
                          color: C.primary,
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M12 16V8M12 8L9 11M12 8l3 3M5 16.5c0 1.1.9 2 2 2h10a2 2 0 0 0 2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div style={{ fontSize: "clamp(16px, 1.3vw, 30px)", fontWeight: 800, color: C.ink }}>
                        Drag and Drop or{" "}
                        <span style={{ color: C.primary }}>Browse to Upload</span>
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
                  style={{
                    border: "none",
                    background: "transparent",
                    color: C.primary,
                    fontSize: "clamp(13px, 1.1vw, 22px)",
                    fontWeight: 700,
                    textAlign: "left",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  i Download sample data for file upload
                </button>

                {uploadStatus?.error && <div style={{ color: C.danger, fontSize: "clamp(10px, 0.8vw, 13px)" }}>{uploadStatus.error}</div>}

                <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end", gap: 14 }}>
                  <button
                    type="button"
                    onClick={handleCancelUpload}
                    style={{
                      borderRadius: 14,
                      border: `1px solid ${C.border}`,
                      background: C.white,
                      color: C.inkMid,
                      fontSize: "clamp(14px, 1.2vw, 24px)",
                      fontWeight: 700,
                      padding: "10px 34px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadContacts}
                    disabled={!canUpload}
                    style={{
                      borderRadius: 14,
                      border: "none",
                      background: canUpload ? C.primary : uploadCompleted ? "#b7c3d6" : C.mutedButton,
                      color: "#ffffff",
                      fontSize: "clamp(14px, 1.2vw, 24px)",
                      fontWeight: 800,
                      padding: "10px 34px",
                      cursor: canUpload ? "pointer" : "not-allowed",
                      filter: uploadCompleted ? "blur(0.7px)" : "none",
                      opacity: uploadCompleted ? 0.9 : 1,
                    }}
                  >
                    {uploadStatus?.loading ? "Uploading..." : uploadCompleted ? "Uploaded" : "Upload"}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 32px 14px" }}>
                <div style={{ fontSize: "clamp(20px, 1.6vw, 34px)", color: C.ink, fontWeight: 800, lineHeight: 1.08 }}>CSV Error Check</div>
                <div style={{ fontSize: "clamp(13px, 1.1vw, 22px)", lineHeight: 1.25, color: C.inkSoft, marginTop: 8 }}>Status after contact file upload.</div>
              </div>

              <div style={{ minHeight: singleColumn ? 360 : 470, padding: "24px 20px", display: "grid", placeItems: "center" }}>
                {uploadStatus?.loading ? (
                  <div
                    style={{
                      width: "80%",
                      maxWidth: 620,
                      minHeight: 90,
                      border: `2px dashed ${C.borderSoft}`,
                      borderRadius: 18,
                      display: "grid",
                      placeItems: "center",
                      color: C.inkSoft,
                      fontSize: "clamp(13px, 1vw, 18px)",
                      textAlign: "center",
                      padding: "10px 16px",
                    }}
                  >
                    Checking uploaded file...
                  </div>
                ) : uploadStatus?.error ? (
                  <div
                    style={{
                      width: "80%",
                      maxWidth: 620,
                      border: "1px solid #f4b4b4",
                      borderRadius: 18,
                      padding: 20,
                      background: "#fff5f5",
                      color: "#b42318",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "clamp(42px, 4vw, 68px)", fontWeight: 900, lineHeight: 1 }}>✕</div>
                    <div style={{ fontSize: "clamp(14px, 1vw, 18px)", fontWeight: 800, marginTop: 4 }}>Upload failed</div>
                    <div style={{ fontSize: "clamp(12px, 0.9vw, 15px)", lineHeight: 1.4, marginTop: 8 }}>{uploadStatus.error}</div>
                  </div>
                ) : uploadStatus ? (
                  uploadHasDataIssues ? (
                    <div
                      style={{
                        width: "80%",
                        maxWidth: 620,
                        border: "1px solid #f4b4b4",
                        borderRadius: 18,
                        padding: 20,
                        background: "#fff5f5",
                        color: "#b42318",
                        textAlign: "center",
                      }}
                    >
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
                    <div
                      style={{
                        width: "80%",
                        maxWidth: 620,
                        border: "1px solid #92d7a0",
                        borderRadius: 18,
                        padding: 20,
                        background: "#f0fdf4",
                        color: "#166534",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "clamp(78px, 9vw, 148px)", fontWeight: 900, lineHeight: 0.9 }}>✓</div>
                      <div style={{ fontSize: "clamp(14px, 1vw, 18px)", fontWeight: 800, marginTop: 4 }}>0 errors found</div>
                      <div style={{ fontSize: "clamp(12px, 0.9vw, 15px)", lineHeight: 1.5, marginTop: 10 }}>
                        <div>File passed validation and is ready to send.</div>
                        <div>Valid contacts: <strong>{uploadStatus.valid_count || 0}</strong></div>
                      </div>
                    </div>
                  )
                ) : (
                  <div
                    style={{
                      width: "80%",
                      maxWidth: 620,
                      minHeight: 90,
                      border: `2px dashed ${C.borderSoft}`,
                      borderRadius: 18,
                      display: "grid",
                      placeItems: "center",
                      color: C.inkSoft,
                      fontSize: "clamp(13px, 1.1vw, 22px)",
                      textAlign: "center",
                      padding: "10px 16px",
                    }}
                  >
                    Upload a contact file to run error checks.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section style={{ ...cardStyle(), marginTop: 20 }}>
          <div style={{ textAlign: "center", borderBottom: `1px solid ${C.border}`, padding: "16px 20px" }}>
            <div style={{ fontSize: "clamp(22px, 1.8vw, 38px)", fontWeight: 800, color: C.ink, lineHeight: 1.08 }}>Summary and Send</div>
            <div style={{ marginTop: 4, fontSize: "clamp(13px, 1vw, 21px)", color: C.inkSoft }}>Review details and send campaign.</div>
          </div>

          <div style={{ textAlign: "center", padding: "28px 20px 34px" }}>
            <div style={{ fontSize: "clamp(16px, 1.3vw, 30px)", lineHeight: 1.55, color: C.inkMid }}>
              <div>
                Sent To: <strong style={{ color: C.ink }}>{recipients.length} contacts</strong>
              </div>
              <div>
                From: <strong style={{ color: C.ink }}>{replyTo.trim() || "Not set"}</strong>
              </div>
              <div>
                Template: <strong style={{ color: C.ink }}>{selectedTemplateLabel}</strong>
              </div>
              <div>
                Subject: <strong style={{ color: C.ink }}>{subject.trim() || "Not set"}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendCampaign}
              disabled={!canSend}
              style={{
                marginTop: 18,
                border: "none",
                borderRadius: 16,
                background: canSend ? C.primary : C.mutedButton,
                color: "#fff",
                fontSize: "clamp(15px, 1.2vw, 24px)",
                fontWeight: 800,
                padding: "14px 44px",
                cursor: canSend ? "pointer" : "not-allowed",
              }}
            >
              {sending ? "Sending..." : "Send Campaign"}
            </button>

            {sendResult?.error && <div style={{ marginTop: 14, color: C.danger, fontSize: "clamp(10px, 0.8vw, 13px)" }}>{sendResult.error}</div>}
            {sendResult && !sendResult.error && (
              <div style={{ marginTop: 14, color: C.inkMid, fontSize: "clamp(10px, 0.8vw, 13px)" }}>
                Sent: <strong>{sendResult.sent_count || 0}</strong>
                {typeof sendResult.error_count === "number" ? ` | Failed: ${sendResult.error_count}` : ""}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
