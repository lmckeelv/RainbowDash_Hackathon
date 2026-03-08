import { useEffect, useRef, useState } from "react";

const API = (
  import.meta.env.VITE_API_BASE_URL ||
  ((typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
    ? "http://127.0.0.1:8000"
    : "https://rainbowdashhackathon-production.up.railway.app")
).replace(/\/$/, "");

const FALLBACK_TEMPLATES = [
  "bold", "dark", "earthy", "new-message", "gradient",
  "newsletter", "paper", "neon", "forest", "retro", "minimal",
];

const C = {
  primary:       "#5b4bdb",
  primaryLight:  "#ede9ff",
  primaryBorder: "#c5bcf7",
  surface:       "#ffffff",
  canvas:        "#f4f5fb",
  border:        "#e0e4f0",
  borderSoft:    "#edf0f8",
  ink:           "#16172b",
  inkMid:        "#4a5068",
  inkSoft:       "#8d95b0",
  danger:        "#c93535",
  dangerLight:   "#fff4f4",
  dangerBorder:  "#f5b8b8",
  success:       "#1a6b3c",
  successLight:  "#f0fdf6",
  successBorder: "#86d4a8",
  muted:         "#c8d0e0",
};

const STEPS = [
  { id: 1, label: "Compose Email and Template Preview" },
  { id: 2, label: "Upload Contacts" },
  { id: 3, label: "Summary and Send" },
];

function toLabel(value) {
  return (value || "")
    .split(/[-_]/g)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function Field({ label, hint, required, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: C.inkMid }}>
          {label}{required && <span style={{ color: C.danger, marginLeft: 3 }}>*</span>}
        </label>
        {hint && <span style={{ fontSize: 11, color: C.inkSoft }}>{hint}</span>}
      </div>
      {children}
      {error && <span style={{ fontSize: 11, color: C.danger, fontWeight: 600 }}>{error}</span>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", hasError = false }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        width: "100%", boxSizing: "border-box", borderRadius: 10,
        border: `1.5px solid ${hasError ? C.dangerBorder : focused ? C.primaryBorder : C.border}`,
        padding: "10px 13px", fontSize: 14, color: C.ink, outline: "none",
        background: focused ? "#fff" : "#fafbfe",
        boxShadow: focused ? `0 0 0 3px ${hasError ? "rgba(201,53,53,0.1)" : "rgba(91,75,219,0.1)"}` : "none",
        transition: "all 0.15s", fontFamily: "inherit",
      }}
    />
  );
}

function Stepper({ activeStep }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
      {STEPS.map((step, i) => {
        const active = step.id === activeStep;
        const done   = step.id < activeStep;
        return (
          <div key={step.id} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ textAlign: "center", minWidth: 160 }}>
              <div style={{
                width: 38, height: 38, margin: "0 auto 5px", borderRadius: "50%",
                background: active ? C.primary : done ? C.primaryLight : "#eef0f8",
                border: `2px solid ${active ? C.primary : done ? C.primaryBorder : C.border}`,
                color: active ? "#fff" : done ? C.primary : C.inkSoft,
                fontSize: 12, fontWeight: 800, display: "grid", placeItems: "center",
                boxShadow: active ? "0 4px 12px rgba(91,75,219,0.25)" : "none",
                transition: "all 0.25s",
              }}>
                {done ? "✓" : String(step.id).padStart(2, "0")}
              </div>
              <div style={{
                fontSize: 11, fontWeight: 700, lineHeight: 1.2,
                color: active ? C.primary : done ? C.inkMid : C.inkSoft,
                transition: "color 0.25s",
              }}>
                {step.label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width: 64, height: 2, borderRadius: 999, marginBottom: 28,
                background: step.id < activeStep ? C.primaryBorder : C.border,
                transition: "background 0.25s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SendResultModal({ result, onClose }) {
  if (!result) return null;
  const failed    = result.error && !result.sent_count;
  const hasErrors = result.error_count > 0;
  const total     = (result.sent_count || 0) + (result.error_count || 0);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(16,17,35,0.6)", backdropFilter: "blur(5px)",
      display: "grid", placeItems: "center", padding: 20,
    }}>
      <div style={{
        background: C.surface, borderRadius: 24, width: "100%", maxWidth: 500,
        boxShadow: "0 32px 80px rgba(16,17,35,0.25)", overflow: "hidden",
        animation: "pop 0.2s cubic-bezier(0.34,1.5,0.64,1)",
      }}>
        <style>{`@keyframes pop { from { transform:scale(0.92);opacity:0 } to { transform:scale(1);opacity:1 } }`}</style>
        <div style={{ padding: "32px 32px 20px", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 52, lineHeight: 1, color: failed ? C.danger : C.success }}>{failed ? "✕" : "✓"}</div>
          <div style={{ marginTop: 10, fontSize: 22, fontWeight: 800, color: C.ink }}>
            {failed ? "Send Failed" : hasErrors ? "Sent with Errors" : "Campaign Sent!"}
          </div>
          {!failed && <div style={{ marginTop: 6, fontSize: 14, color: C.inkMid }}><strong>{result.sent_count}</strong> of <strong>{total}</strong> emails delivered</div>}
          {failed && <div style={{ marginTop: 6, fontSize: 13, color: C.danger }}>{result.error}</div>}
        </div>
        {!failed && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: C.border }}>
            {[
              { label: "Delivered", val: result.sent_count || 0, color: C.success, bg: C.successLight },
              { label: "Failed",    val: result.error_count || 0, color: C.danger,  bg: C.dangerLight  },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, padding: "18px 0", textAlign: "center" }}>
                <div style={{ fontSize: 34, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: C.inkSoft, marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
        {hasErrors && result.errors?.length > 0 && (
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: C.inkMid, marginBottom: 8 }}>Failed Addresses</div>
            <div style={{ maxHeight: 150, overflowY: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
              {result.errors.map((e, i) => (
                <div key={i} style={{ background: C.dangerLight, border: `1px solid ${C.dangerBorder}`, borderRadius: 8, padding: "7px 11px", fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: C.danger }}>{e.email}</span>
                  {e.error && <span style={{ color: C.inkSoft, marginLeft: 6 }}>— {e.error}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ padding: "20px 32px", borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
          <button onClick={onClose} style={{ border: "none", borderRadius: 12, background: C.primary, color: "#fff", fontSize: 14, fontWeight: 700, padding: "11px 44px", cursor: "pointer", fontFamily: "inherit" }}>Done</button>
        </div>
      </div>
    </div>
  );
}

function StatusBox({ color, bg, border, icon, title, detail, large }) {
  return (
    <div style={{ width: "80%", maxWidth: 440, border: `1px solid ${border}`, borderRadius: 18, padding: "24px 20px", background: bg, color, textAlign: "center" }}>
      <div style={{ fontSize: large ? 80 : 48, fontWeight: 900, lineHeight: 1, color }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 800, marginTop: 8, color }}>{title}</div>
      {detail && <div style={{ fontSize: 13, lineHeight: 1.6, marginTop: 8, opacity: 0.85 }}>{detail}</div>}
    </div>
  );
}

export default function EmailEditor() {
  const [subject,      setSubject]      = useState("");
  const [businessName, setBusinessName] = useState("");
  const [header,       setHeader]       = useState("");
  const [body,         setBody]         = useState("");
  const [website,      setWebsite]      = useState("");
  const [replyTo,      setReplyTo]      = useState("");

  const [templates,        setTemplates]        = useState([]);
  const [loadingTemplates, setLoadingTemplates]  = useState(true);
  const [previewIndex,     setPreviewIndex]      = useState(0);
  const [selectedTemplate, setSelectedTemplate]  = useState("dark");
  const [previewKey,       setPreviewKey]        = useState(0);
  const [deviceMode,       setDeviceMode]        = useState("desktop");

  const [selectedFile,  setSelectedFile]  = useState(null);
  const [dragActive,    setDragActive]    = useState(false);
  const [uploadStatus,  setUploadStatus]  = useState(null);
  const [recipients,    setRecipients]    = useState([]);

  const [sending,     setSending]     = useState(false);
  const [sendResult,  setSendResult]  = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [showErrors,  setShowErrors]  = useState(false);
  const [bodyFocused, setBodyFocused] = useState(false);

  const previewTimer      = useRef(null);
  const fileInputRef      = useRef(null);
  const summarySectionRef = useRef(null);

  const templateOptions      = templates.length > 0 ? templates : FALLBACK_TEMPLATES;
  const hasRecipients        = recipients.length > 0;
  const composeReady         = Boolean(subject.trim() && body.trim() && selectedTemplate);
  const uploadCompleted      = Boolean(uploadStatus && !uploadStatus.loading && !uploadStatus.error);
  const uploadInvalidCount   = Number(uploadStatus?.invalid_count   || 0);
  const uploadDuplicateCount = Number(uploadStatus?.duplicate_count || 0);
  const uploadHasIssues      = (uploadInvalidCount + uploadDuplicateCount) > 0;
  const csvReady             = Boolean(uploadCompleted && !uploadHasIssues && hasRecipients);
  const canUpload            = Boolean(selectedFile && !uploadStatus?.loading && !uploadCompleted);
  const canSend              = Boolean(csvReady && composeReady && !sending);
  const activeStep           = !composeReady ? 1 : !hasRecipients ? 2 : 3;
  const wordCount            = body.trim() ? body.trim().split(/\s+/).length : 0;

  useEffect(() => {
    setLoadingTemplates(true);
    fetch(`${API}/templates`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data.templates) ? data.templates : [];
        if (list.length > 0) {
          const di = Math.max(0, list.findIndex(n => n.toLowerCase() === "dark"));
          setTemplates(list);
          setPreviewIndex(di);
          setSelectedTemplate(list[di]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTemplates(false));
  }, []);

  useEffect(() => {
    clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => setPreviewKey(k => k + 1), 400);
    return () => clearTimeout(previewTimer.current);
  }, [subject, businessName, header, body, website, selectedTemplate]);

  function buildPreviewUrl(name) {
    if (!name || !templates.includes(name)) return null;
    const p = new URLSearchParams({
      name: "[Name]",
      subject: subject.trim() || "Your Subject Line",
      header: header.trim() || "Your headline here",
      body: body.trim() || "Your email body will appear here.",
      business_name: businessName.trim() || "Your Business",
      website: website.trim() || "https://yourwebsite.com",
    });
    return `${API}/preview/${name}?${p}`;
  }

  function handleSelectTemplate(index) {
    const next = templateOptions[index];
    if (!next) return;
    setPreviewIndex(index);
    setSelectedTemplate(next);
  }

  function handleFileSelected(file) {
    if (!file) return;
    setSelectedFile(file);
    setUploadStatus(null);
    setRecipients([]);
    setSendResult(null);
  }

  function handleCancelUpload() {
    setSelectedFile(null);
    setUploadStatus(null);
    setRecipients([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleUploadContacts() {
    if (!selectedFile) return;
    setUploadStatus({ loading: true });
    setRecipients([]);
    const fd = new FormData();
    fd.append("file", selectedFile);
    try {
      const res = await fetch(`${API}/upload-contacts`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed.");
      setRecipients(Array.isArray(data.recipients) ? data.recipients : []);
      setUploadStatus(data);
    } catch (err) {
      setUploadStatus({ error: err.message || "Upload failed." });
    }
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
          recipients, template_name: selectedTemplate,
          subject: subject.trim(), header: header.trim(),
          body: body.trim(), business_name: businessName.trim(),
          website: website.trim(), reply_to: replyTo.trim(),
        }),
      });
      const data = await res.json();
      setSendResult(res.ok ? data : { error: data.detail || `Error ${res.status}`, sent_count: 0, error_count: 0 });
      setShowModal(true);
    } catch (err) {
      setSendResult({ error: err.message || "Send failed.", sent_count: 0, error_count: 0 });
      setShowModal(true);
    } finally {
      setSending(false);
    }
  }

  function fmtSize(b) {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  }

  const previewUrl = buildPreviewUrl(selectedTemplate);

  const sectionCard = {
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 20, overflow: "hidden", marginBottom: 20,
    boxShadow: "0 2px 16px rgba(22,23,43,0.05)",
  };

  const sectionHead = {
    padding: "18px 28px 14px",
    borderBottom: `1px solid ${C.border}`,
    background: "#fafbfe",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.canvas, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::placeholder { color: #b0b8ce; }
        textarea { font-family: inherit; }
      `}</style>

      {showModal && sendResult && <SendResultModal result={sendResult} onClose={() => setShowModal(false)} />}

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "rgba(255,255,255,0.97)", borderBottom: `1px solid ${C.border}`,
        backdropFilter: "blur(8px)", padding: "10px 28px",
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{ minWidth: 180 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: C.inkSoft }}>MailDash</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.ink, letterSpacing: "-0.3px", lineHeight: 1 }}>Create Campaign</div>
        </div>
        <Stepper activeStep={activeStep} />
        <button
          onClick={() => summarySectionRef.current?.scrollIntoView({ behavior: "smooth" })}
          disabled={!canSend}
          style={{
            minWidth: 110, border: "none", borderRadius: 10, padding: "9px 20px",
            fontSize: 13, fontWeight: 700, background: canSend ? C.primary : C.muted, color: "#fff",
            cursor: canSend ? "pointer" : "not-allowed",
            boxShadow: canSend ? "0 2px 10px rgba(91,75,219,0.3)" : "none",
            transition: "all 0.15s", fontFamily: "inherit",
          }}
        >Complete</button>
      </header>

      <main style={{ maxWidth: 1500, margin: "0 auto", padding: "24px 28px 40px" }}>

        {/* Step 1: Compose */}
        <div style={sectionCard}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>

            {/* Compose fields */}
            <div style={{ borderRight: `1px solid ${C.border}` }}>
              <div style={sectionHead}>
                <div style={{ fontSize: 17, fontWeight: 800, color: C.ink }}>Compose Email</div>
                <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>Fill in your campaign details.</div>
              </div>
              <div style={{ padding: "20px 28px", display: "grid", gap: 14 }}>
                <Field label="Subject" required error={showErrors && !subject.trim() ? "Subject is required." : null}>
                  <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Big news from our team!" hasError={showErrors && !subject.trim()} />
                </Field>
                <Field label="Business Name">
                  <Input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. MailDash Co." />
                </Field>
                <Field label="Header">
                  <Input value={header} onChange={e => setHeader(e.target.value)} placeholder="e.g. We have exciting news for you!" />
                </Field>
                <Field label="Body" required hint={`${wordCount} word${wordCount !== 1 ? "s" : ""}`} error={showErrors && !body.trim() ? "Body is required." : null}>
                  <p style={{ fontSize: 11, color: C.inkSoft, margin: "0 0 5px" }}>Emails start with "Hi [name]," automatically.</p>
                  <textarea
                    rows={7} value={body}
                    onChange={e => setBody(e.target.value)}
                    onFocus={() => setBodyFocused(true)}
                    onBlur={() => setBodyFocused(false)}
                    placeholder="Write your campaign message here..."
                    style={{
                      width: "100%", borderRadius: 10, resize: "vertical",
                      border: `1.5px solid ${showErrors && !body.trim() ? C.dangerBorder : bodyFocused ? C.primaryBorder : C.border}`,
                      padding: "10px 13px", fontSize: 14, lineHeight: 1.65,
                      outline: "none", color: C.ink,
                      background: bodyFocused ? "#fff" : "#fafbfe",
                      boxShadow: bodyFocused ? "0 0 0 3px rgba(91,75,219,0.1)" : "none",
                      transition: "all 0.15s",
                    }}
                  />
                </Field>
                <Field label="Website">
                  <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="e.g. https://maildash.gay" />
                </Field>
                <Field label="Reply-To Email" hint="Replies go here">
                  <Input value={replyTo} onChange={e => setReplyTo(e.target.value)} placeholder="e.g. hello@maildash.gay" type="email" />
                </Field>
              </div>
            </div>

            {/* Template preview */}
            <div style={{ background: "#f7f8fd", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: C.ink }}>
                Template Preview
                {selectedTemplate && <span style={{ fontSize: 12, fontWeight: 600, color: C.primary, marginLeft: 10 }}>{toLabel(selectedTemplate)}</span>}
              </div>

              {/* Carousel */}
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                {/* Left arrow */}
                <button
                  onClick={() => handleSelectTemplate((previewIndex - 1 + templateOptions.length) % templateOptions.length)}
                  style={{ position: "absolute", left: -14, top: "50%", transform: "translateY(-50%)", zIndex: 20, width: 32, height: 32, borderRadius: "50%", border: `1px solid ${C.border}`, background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(22,23,43,0.08)", flexShrink: 0 }}
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9 2.5L4 7l5 4.5" stroke={C.inkMid} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {/* Right arrow */}
                <button
                  onClick={() => handleSelectTemplate((previewIndex + 1) % templateOptions.length)}
                  style={{ position: "absolute", right: -14, top: "50%", transform: "translateY(-50%)", zIndex: 20, width: 32, height: 32, borderRadius: "50%", border: `1px solid ${C.border}`, background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(22,23,43,0.08)", flexShrink: 0 }}
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M5 2.5l5 4.5-5 4.5" stroke={C.inkMid} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>

                {/* Stacked cards */}
                <div style={{ position: "relative", width: "100%", height: 420, margin: "0 14px" }}>
                  {templateOptions.map((name, index) => {
                    const total  = templateOptions.length;
                    const offset = (index - previewIndex + total) % total;
                    const isActive = offset === 0;
                    const isNext   = offset === 1;
                    const isPrev   = offset === total - 1;
                    let tx = 0, ty = 0, rot = 0, z = 1, op = 0.25, sc = 0.88;
                    if (isActive) { tx = 0;   ty = 0;  rot = 0;  z = 10; op = 1;    sc = 1;    }
                    if (isNext)   { tx = 18;  ty = 14; rot = 2;  z = 5;  op = 0.6;  sc = 0.94; }
                    if (isPrev)   { tx = -18; ty = 14; rot = -2; z = 5;  op = 0.6;  sc = 0.94; }
                    return (
                      <div
                        key={name}
                        onClick={() => !isActive && handleSelectTemplate(index)}
                        style={{
                          position: "absolute", inset: 0, zIndex: z,
                          transform: `translate(${tx}px,${ty}px) rotate(${rot}deg) scale(${sc})`,
                          opacity: op,
                          transition: "all 0.38s cubic-bezier(0.34,1.4,0.64,1)",
                          cursor: isActive ? "default" : "pointer",
                          borderRadius: 14,
                          border: `2px solid ${isActive ? C.primary : C.border}`,
                          background: C.surface,
                          boxShadow: isActive ? "0 8px 32px rgba(91,75,219,0.18)" : "0 2px 8px rgba(22,23,43,0.06)",
                          overflow: "hidden",
                        }}
                      >
                        {/* Mini browser chrome */}
                        <div style={{ height: 26, display: "flex", alignItems: "center", gap: 5, padding: "0 10px", background: "#f1f5f9", borderBottom: `1px solid ${C.border}` }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f87171" }} />
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fbbf24" }} />
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399" }} />
                          <div style={{ marginLeft: 8, height: 12, width: 120, borderRadius: 4, background: "rgba(255,255,255,0.9)" }} />
                          {isActive && <div style={{ marginLeft: "auto", padding: "2px 7px", borderRadius: 4, background: C.primary, color: "#fff", fontSize: 9, fontWeight: 700 }}>SELECTED</div>}
                        </div>
                        <div style={{ background: "#dde3ee", padding: 8, height: "calc(100% - 26px)" }}>
                          <div style={{
                            height: "100%", borderRadius: 8, overflow: "hidden",
                            border: `1px solid ${C.border}`, background: C.surface,
                            maxWidth: deviceMode === "mobile" ? 260 : "none",
                            margin: deviceMode === "mobile" ? "0 auto" : 0,
                          }}>
                            {isActive ? (
                              <iframe
                                key={`${name}-${previewKey}-${deviceMode}`}
                                title={`preview-${name}`}
                                src={buildPreviewUrl(name)}
                                style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                              />
                            ) : (
                              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <div style={{ textAlign: "center" }}>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: C.inkMid }}>{toLabel(name)}</div>
                                  <div style={{ fontSize: 11, color: C.primary, marginTop: 8, fontWeight: 600 }}>Click to select</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Template tabs */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {templateOptions.map((name, index) => {
                  const sel = name === selectedTemplate;
                  return (
                    <button key={name} onClick={() => handleSelectTemplate(index)} style={{
                      flex: "1 1 90px", padding: "7px 10px", borderRadius: 10,
                      border: `1.5px solid ${sel ? C.primary : C.border}`,
                      background: sel ? C.primaryLight : C.surface,
                      color: sel ? C.primary : C.ink,
                      fontSize: 11, fontWeight: 700, cursor: "pointer", textAlign: "left",
                      transition: "all 0.15s", fontFamily: "inherit",
                      display: "flex", alignItems: "center", gap: 5,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: sel ? C.primary : C.border, flexShrink: 0 }} />
                      {toLabel(name)}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ display: "inline-flex", gap: 3, border: `1px solid ${C.border}`, borderRadius: 12, padding: 3, background: C.surface }}>
                  {["desktop", "mobile"].map(mode => (
                    <button key={mode} onClick={() => setDeviceMode(mode)} style={{
                      border: "none", borderRadius: 9, padding: "7px 20px",
                      fontSize: 12, fontWeight: 700, textTransform: "capitalize",
                      background: deviceMode === mode ? C.primary : "transparent",
                      color: deviceMode === mode ? "#fff" : C.inkMid,
                      cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
                    }}>{mode}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Upload Contacts */}
        <div style={sectionCard}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>

            {/* Uploader */}
            <div style={{ borderRight: `1px solid ${C.border}` }}>
              <div style={sectionHead}>
                <div style={{ fontSize: 17, fontWeight: 800, color: C.ink }}>Upload Contacts</div>
                <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>
                  Upload a CSV with <code style={{ background: C.canvas, padding: "1px 5px", borderRadius: 4 }}>name</code> and <code style={{ background: C.canvas, padding: "1px 5px", borderRadius: 4 }}>email</code> columns. One file at a time.
                </div>
              </div>

              <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 16, minHeight: 360 }}>
                <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={e => handleFileSelected(e.target.files?.[0])} style={{ display: "none" }} />

                <div
                  onClick={!selectedFile ? () => fileInputRef.current?.click() : undefined}
                  onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); setDragActive(false); handleFileSelected(e.dataTransfer.files?.[0]); }}
                  style={{
                    border: `2px dashed ${dragActive ? C.primary : selectedFile ? C.primaryBorder : C.border}`,
                    borderRadius: 16, minHeight: 200, display: "grid", placeItems: "center", textAlign: "center",
                    background: dragActive ? C.primaryLight : selectedFile ? "#f8f7ff" : "#fafbfe",
                    cursor: !selectedFile ? "pointer" : "default",
                    transition: "all 0.2s", padding: 20,
                  }}
                >
                  {selectedFile ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: C.primaryLight, color: C.primary, display: "grid", placeItems: "center" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 13px", width: "100%", maxWidth: 340 }}>
                        <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedFile.name}</div>
                          <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 1 }}>{fmtSize(selectedFile.size)}</div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); handleCancelUpload(); }} style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", border: `1px solid ${C.border}`, background: C.surface, color: C.inkSoft, cursor: "pointer", display: "grid", placeItems: "center" }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                      <div style={{ fontSize: 11, color: C.inkSoft }}>Drop a new file to replace, or click × to remove</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ width: 46, height: 46, margin: "0 auto 12px", borderRadius: "50%", background: C.primaryLight, color: C.primary, display: "grid", placeItems: "center" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                          <path d="M12 16V8M12 8L9 11M12 8l3 3M5 16.5c0 1.1.9 2 2 2h10a2 2 0 0 0 2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>
                        Drag and Drop or <span style={{ color: C.primary }}>Browse to Upload</span>
                      </div>
                      <div style={{ marginTop: 6, fontSize: 12, color: C.inkSoft }}>Supported formats: <strong>csv</strong></div>
                    </div>
                  )}
                </div>

                <button onClick={() => fileInputRef.current?.click()} style={{ border: "none", background: "transparent", color: C.primary, fontSize: 12, fontWeight: 700, textAlign: "left", padding: 0, cursor: "pointer", fontFamily: "inherit" }}>
                  ↓ Download sample data for file upload
                </button>

                {uploadStatus?.error && <div style={{ fontSize: 12, color: C.danger }}>{uploadStatus.error}</div>}

                <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button onClick={handleCancelUpload} style={{ borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.inkMid, fontSize: 13, fontWeight: 700, padding: "9px 24px", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                  <button onClick={handleUploadContacts} disabled={!canUpload} style={{
                    borderRadius: 10, border: "none",
                    background: canUpload ? C.primary : uploadCompleted ? "#a8b5c8" : C.muted,
                    color: "#fff", fontSize: 13, fontWeight: 800,
                    padding: "9px 28px", cursor: canUpload ? "pointer" : "not-allowed",
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}>
                    {uploadStatus?.loading ? "Uploading…" : uploadCompleted ? "Uploaded ✓" : "Upload"}
                  </button>
                </div>
              </div>
            </div>

            {/* Validation results */}
            <div>
              <div style={sectionHead}>
                <div style={{ fontSize: 17, fontWeight: 800, color: C.ink }}>CSV Error Check</div>
                <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>Status after contact file upload.</div>
              </div>
              <div style={{ minHeight: 360, padding: 24, display: "grid", placeItems: "center" }}>
                {uploadStatus?.loading ? (
                  <StatusBox color={C.inkSoft} bg={C.canvas} border={C.border} icon="⏳" title="Checking file…" />
                ) : uploadStatus?.error ? (
                  <StatusBox color={C.danger} bg={C.dangerLight} border={C.dangerBorder} icon="✕" title="Upload failed" detail={uploadStatus.error} />
                ) : uploadStatus ? (
                  uploadHasIssues ? (
                    <StatusBox color={C.danger} bg={C.dangerLight} border={C.dangerBorder} icon="✕"
                      title={`${uploadInvalidCount + uploadDuplicateCount} errors found`}
                      detail={<><div>Invalid rows: <strong>{uploadInvalidCount}</strong></div><div>Duplicate rows: <strong>{uploadDuplicateCount}</strong></div><div>Valid contacts: <strong>{uploadStatus.valid_count || 0}</strong></div></>}
                    />
                  ) : (
                    <StatusBox color={C.success} bg={C.successLight} border={C.successBorder} icon="✓" title="0 errors found" large
                      detail={<><div>File passed validation and is ready to send.</div><div>Valid contacts: <strong>{uploadStatus.valid_count || 0}</strong></div></>}
                    />
                  )
                ) : (
                  <div style={{ width: "80%", maxWidth: 440, minHeight: 90, border: `2px dashed ${C.borderSoft}`, borderRadius: 16, display: "grid", placeItems: "center", color: C.inkSoft, fontSize: 13, textAlign: "center", padding: 20 }}>
                    Upload a contact file to run error checks.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Summary & Send */}
        <div ref={summarySectionRef} style={sectionCard}>
          <div style={{ textAlign: "center", borderBottom: `1px solid ${C.border}`, padding: "18px 20px", background: "#fafbfe" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>Summary and Send</div>
            <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 3 }}>Review details and send campaign.</div>
          </div>

          <div style={{ textAlign: "center", padding: "28px 20px 36px" }}>
            <div style={{ fontSize: 15, lineHeight: 1.7, color: C.inkMid }}>
              <div>Sent To: <strong style={{ color: C.ink }}>{recipients.length} contacts</strong></div>
              <div>Template: <strong style={{ color: C.ink }}>{toLabel(selectedTemplate)}</strong></div>
              <div>Subject: <strong style={{ color: C.ink }}>{subject.trim() || "Not set"}</strong></div>
            </div>

            <div style={{ marginTop: 18, display: "inline-flex", flexDirection: "column", gap: 7, textAlign: "left" }}>
              {[
                { label: "Subject written",               ok: Boolean(subject.trim()) },
                { label: "Body written",                  ok: Boolean(body.trim()) },
                { label: "Template selected",             ok: Boolean(selectedTemplate) },
                { label: "Contacts uploaded & validated", ok: csvReady },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                    background: item.ok ? C.successLight : C.dangerLight,
                    border: `1px solid ${item.ok ? C.successBorder : C.dangerBorder}`,
                    color: item.ok ? C.success : C.danger,
                    display: "grid", placeItems: "center", fontSize: 9, fontWeight: 900,
                  }}>{item.ok ? "✓" : "✕"}</span>
                  <span style={{ fontSize: 13, color: item.ok ? C.inkMid : C.danger, fontWeight: item.ok ? 500 : 600 }}>{item.label}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 26 }}>
              <button
                onClick={handleSendCampaign}
                disabled={!canSend}
                style={{
                  border: "none", borderRadius: 14,
                  background: canSend ? C.primary : C.muted,
                  color: "#fff", fontSize: 15, fontWeight: 800,
                  padding: "13px 44px", cursor: canSend ? "pointer" : "not-allowed",
                  boxShadow: canSend ? "0 4px 16px rgba(91,75,219,0.3)" : "none",
                  transition: "all 0.15s", fontFamily: "inherit", opacity: sending ? 0.8 : 1,
                }}
              >
                {sending ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg style={{ animation: "spin 0.8s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12"/>
                    </svg>
                    Sending {recipients.length} emails…
                  </span>
                ) : (
                  `Send Campaign → ${recipients.length} recipient${recipients.length !== 1 ? "s" : ""}`
                )}
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}