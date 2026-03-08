import { useEffect, useRef, useState } from "react";

const API = "https://rainbowdashhackathon-production.up.railway.app";

const C = {
  primary:       "#4f46e5",
  primaryLight:  "#eef2ff",
  primaryBorder: "#c7d2fe",
  primaryText:   "#4338ca",
  surface:       "#ffffff",
  panelBg:       "#f8fafc",
  border:        "#e2e8f0",
  ink:           "#0f172a",
  inkMid:        "#475569",
  inkSoft:       "#94a3b8",
  red:           "#ef4444",
  redLight:      "#fef2f2",
  redBorder:     "#fecaca",
};

function toLabel(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function Field({ label, error, hint, children, required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: C.inkMid }}>
          {label}{required && <span style={{ color: C.red, marginLeft: 2 }}>*</span>}
        </label>
        {hint && <span style={{ fontSize: 11, color: C.inkSoft }}>{hint}</span>}
      </div>
      {children}
      {error && <span style={{ fontSize: 11, fontWeight: 500, color: C.red }}>{error}</span>}
    </div>
  );
}

function Input({ value, onChange, placeholder, hasError, type = "text" }) {
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
        width: "100%", padding: "9px 12px", fontSize: 13, boxSizing: "border-box",
        border: `1px solid ${hasError ? C.redBorder : focused ? C.primary : C.border}`,
        borderRadius: 8, outline: "none", fontFamily: "inherit",
        background: hasError ? C.redLight : focused ? C.surface : "#f8fafc",
        color: C.ink,
        boxShadow: focused ? `0 0 0 3px ${hasError ? "rgba(239,68,68,0.12)" : "rgba(79,70,229,0.12)"}` : "none",
        transition: "all 0.15s",
      }}
    />
  );
}

export default function EmailEditor() {
  const [subject,      setSubject]      = useState("");
  const [businessName, setBusinessName] = useState("");
  const [header,       setHeader]       = useState("");
  const [body,         setBody]         = useState("");
  const [website,      setWebsite]      = useState("");
  const [replyTo,      setReplyTo]      = useState("");

  const [recipients,   setRecipients]   = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);

  const [templates,        setTemplates]        = useState([]);
  const [previewIndex,     setPreviewIndex]      = useState(0);
  const [selectedTemplate, setSelectedTemplate]  = useState(null);
  const [loadingTemplates, setLoadingTemplates]  = useState(true);

  const [deviceMode, setDeviceMode] = useState("desktop");
  const [sending,    setSending]    = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [taFocused,  setTaFocused]  = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const textareaRef      = useRef(null);
  const previewTimer     = useRef(null);

  const hasRecipients = recipients.length > 0;
  const canSend       = hasRecipients && subject.trim() && body.trim() && selectedTemplate;
  const wordCount     = body.trim() ? body.trim().split(/\s+/).length : 0;

  // Fetch template list from backend
  useEffect(() => {
    setLoadingTemplates(true);
    fetch(`${API}/templates`)
      .then(r => r.json())
      .then(data => {
        const list = data.templates || [];
        setTemplates(list);
        if (list.length > 0) setSelectedTemplate(list[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingTemplates(false));
  }, []);

  // Debounced preview refresh when fields change
  useEffect(() => {
    clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => setPreviewKey(k => k + 1), 500);
    return () => clearTimeout(previewTimer.current);
  }, [subject, businessName, header, body, website, selectedTemplate]);

  function buildPreviewUrl(templateName) {
    if (!templateName) return null;
    const p = new URLSearchParams({
      name:          "[Name]",
      subject:       subject.trim()      || "Your Subject Line",
      header:        header.trim()       || "Your header goes here",
      body:          body.trim()         || "Your email body will appear here. Start typing on the left to see a live preview.",
      business_name: businessName.trim() || "Your Business",
      website:       website.trim()      || "https://yourwebsite.com",
    });
    return `${API}/preview/${templateName}?${p.toString()}`;
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadStatus({ loading: true });
    setRecipients([]);
    setSendResult(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res  = await fetch(`${API}/upload-contacts`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      setRecipients(data.recipients);
      setUploadStatus(data);
    } catch (err) {
      setUploadStatus({ error: err.message });
    }
  }

  async function handleSend() {
    setShowErrors(true);
    if (!canSend) return;
    setSending(true);
    setSendResult(null);
    try {
      const res  = await fetch(`${API}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients,
          template_name:  selectedTemplate,
          subject:        subject.trim(),
          header:         header.trim(),
          body:           body.trim(),
          business_name:  businessName.trim(),
          website:        website.trim(),
          reply_to:       replyTo.trim(),
        }),
      });
      const data = await res.json();
      setSendResult(data);
    } catch (err) {
      setSendResult({ error: err.message });
    } finally {
      setSending(false);
    }
  }

  function handleSelectTemplate(index) {
    setPreviewIndex(index);
    setSelectedTemplate(templates[index]);
  }

  const ph = {
    borderBottom: `1px solid ${C.border}`,
    background: "rgba(248,250,252,0.9)",
    padding: "14px 28px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexShrink: 0,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#f0f1ff 0%,#f5f7ff 50%,#f8f9ff 100%)",
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    }}>
      {/* Header */}
      <header style={{
        borderBottom: `1px solid ${C.border}`,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(8px)",
        padding: "14px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.inkSoft, marginBottom: 2 }}>MailDash</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, letterSpacing: "-0.3px" }}>Create Campaign</div>
        </div>
        <button onClick={handleSend} disabled={!canSend || sending} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "9px 20px", borderRadius: 8, border: "none",
          background: canSend ? C.primary : "#cbd5e1",
          color: "#fff", fontSize: 13, fontWeight: 700,
          cursor: canSend ? "pointer" : "not-allowed",
          boxShadow: canSend ? "0 2px 12px rgba(79,70,229,0.3)" : "none",
          transition: "all 0.15s", fontFamily: "inherit",
        }}>
          {sending ? "Sending…" : hasRecipients ? `Send to ${recipients.length}` : "Send"}
          {!sending && <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 7.5h9M8.5 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>
      </header>

      <div style={{ maxWidth: 1380, margin: "0 auto", padding: "24px 32px" }}>
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 4px 32px rgba(15,23,42,0.08)",
          display: "flex", minHeight: 780,
        }}>

          {/* LEFT: Compose */}
          <div style={{ width: "50%", borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div style={ph}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>Compose Email</div>
                <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>Fill in your campaign details.</div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Subject" required error={showErrors && !subject.trim() ? "Subject is required." : null}>
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Big news from MailDash!" hasError={showErrors && !subject.trim()} />
              </Field>
              <Field label="Business Name">
                <Input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. MailDash Co." />
              </Field>
              <Field label="Header">
                <Input value={header} onChange={e => setHeader(e.target.value)} placeholder="e.g. We have exciting news for you!" />
              </Field>
              <Field label="Body" required hint={`${wordCount} words`} error={showErrors && !body.trim() ? "Body is required." : null}>
                <p style={{ fontSize: 11, color: C.inkSoft, margin: "0 0 6px" }}>Each line becomes a paragraph. Emails start with "Hi [name]," automatically.</p>
                <textarea
                  ref={textareaRef} rows={7} value={body}
                  onChange={e => setBody(e.target.value)}
                  onFocus={() => setTaFocused(true)} onBlur={() => setTaFocused(false)}
                  placeholder="Write your message here..."
                  style={{
                    width: "100%", padding: "10px 12px", fontSize: 13, lineHeight: 1.65,
                    border: `1px solid ${showErrors && !body.trim() ? C.redBorder : taFocused ? C.primary : C.border}`,
                    borderRadius: 10, outline: "none", resize: "vertical",
                    background: showErrors && !body.trim() ? C.redLight : taFocused ? C.surface : "#f8fafc",
                    color: C.ink, boxSizing: "border-box", fontFamily: "inherit",
                    boxShadow: taFocused ? "0 0 0 3px rgba(79,70,229,0.12)" : "none",
                    transition: "all 0.15s",
                  }}
                />
              </Field>
              <Field label="Website">
                <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="e.g. https://maildash.gay" />
              </Field>
              <Field label="Reply-To Email">
                <p style={{ fontSize: 11, color: C.inkSoft, margin: "0 0 4px" }}>Replies from recipients will go here.</p>
                <Input value={replyTo} onChange={e => setReplyTo(e.target.value)} placeholder="e.g. hello@maildash.gay" type="email" />
              </Field>
              <Field label="Recipients">
                <p style={{ fontSize: 11, color: C.inkSoft, margin: "0 0 6px" }}>Upload a CSV with <code>name</code> and <code>email</code> columns.</p>
                <input type="file" accept=".csv,.txt" onChange={handleFileChange} style={{ fontSize: 13, color: C.inkMid }} />
                {uploadStatus?.loading && <p style={{ fontSize: 12, color: C.inkSoft, margin: "6px 0 0" }}>Uploading…</p>}
                {uploadStatus?.error  && <p style={{ fontSize: 12, color: C.red,     margin: "6px 0 0" }}>{uploadStatus.error}</p>}
                {uploadStatus && !uploadStatus.error && !uploadStatus.loading && (
                  <div style={{ fontSize: 12, marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
                    <span> <strong>{uploadStatus.valid_count}</strong> valid recipient{uploadStatus.valid_count !== 1 ? "s" : ""}</span>
                    {uploadStatus.duplicate_count > 0 && <span> {uploadStatus.duplicate_count} duplicate{uploadStatus.duplicate_count !== 1 ? "s" : ""} removed</span>}
                    {uploadStatus.invalid_count  > 0 && <span> {uploadStatus.invalid_count} invalid skipped</span>}
                  </div>
                )}
              </Field>
            </div>

            {/* Footer */}
            <div style={{ borderTop: `1px solid ${C.border}`, background: "rgba(248,250,252,0.9)", padding: "14px 28px", flexShrink: 0 }}>
              <p style={{ fontSize: 12, color: C.inkSoft, margin: "0 0 10px" }}>
                {!hasRecipients
                  ? "⬆ Upload a CSV above to enable sending."
                  : !subject.trim() || !body.trim()
                  ? " Fill in subject and body to send."
                  : ` Ready to send to ${recipients.length} recipient${recipients.length !== 1 ? "s" : ""} using the ${toLabel(selectedTemplate || "")} template.`}
              </p>
              {sendResult && (
                <div style={{ fontSize: 13, marginBottom: 10 }}>
                  {sendResult.error
                    ? <p style={{ color: C.red, margin: 0 }}>{sendResult.error}</p>
                    : <>
                        <p style={{ margin: "0 0 4px" }}>Sent: <strong>{sendResult.sent_count}</strong></p>
                        {sendResult.error_count > 0 && (
                          <>
                            <p style={{ color: C.red, margin: "0 0 4px" }}>Failed: {sendResult.error_count}</p>
                            {sendResult.errors?.map(e => <p key={e.email} style={{ color: C.red, fontSize: 11, margin: "2px 0" }}>{e.email}: {e.error}</p>)}
                          </>
                        )}
                      </>
                  }
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Preview */}
          <div style={{ width: "50%", background: C.panelBg, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div style={ph}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>Preview</div>
                <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>
                  {loadingTemplates
                    ? "Loading templates…"
                    : templates.length === 0
                    ? "No templates found"
                    : <><span style={{ fontWeight: 600, color: "#4338ca" }}>{toLabel(templates[previewIndex] || "")}</span> template selected</>}
                </div>
              </div>
              {templates.length > 0 && (
                <div style={{ padding: "3px 10px", borderRadius: 999, border: `1px solid ${C.border}`, background: C.surface, fontSize: 11, fontWeight: 600, color: C.inkMid }}>
                  {previewIndex + 1} / {templates.length}
                </div>
              )}
            </div>

            <div style={{ flex: 1, padding: "20px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
              {loadingTemplates ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 13, color: C.inkSoft }}>Loading templates…</span>
                </div>
              ) : templates.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 13, color: C.inkSoft }}>No templates found. Add .html files to backend/templates/</span>
                </div>
              ) : (
                <>
                  {/* Carousel */}
                  <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                    <button onClick={() => handleSelectTemplate((previewIndex - 1 + templates.length) % templates.length)} style={{ position: "absolute", left: -14, top: "50%", transform: "translateY(-50%)", zIndex: 20, width: 34, height: 34, borderRadius: "50%", border: `1px solid ${C.border}`, background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(15,23,42,0.08)", flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2.5L4 7l5 4.5" stroke={C.inkMid} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button onClick={() => handleSelectTemplate((previewIndex + 1) % templates.length)} style={{ position: "absolute", right: -14, top: "50%", transform: "translateY(-50%)", zIndex: 20, width: 34, height: 34, borderRadius: "50%", border: `1px solid ${C.border}`, background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(15,23,42,0.08)", flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2.5l5 4.5-5 4.5" stroke={C.inkMid} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>

                    <div style={{ position: "relative", width: "100%", height: 420, margin: "0 10px" }}>
                      {templates.map((templateName, index) => {
                        const total  = templates.length;
                        const offset = (index - previewIndex + total) % total;
                        const isActive = offset === 0;
                        const isNext   = offset === 1;
                        const isPrev   = offset === total - 1;
                        let tx = 0, ty = 0, rot = 0, z = 1, op = 0.3, sc = 0.90;
                        if (isActive) { tx = 0;   ty = 0;  rot = 0;  z = 10; op = 1;    sc = 1; }
                        if (isNext)   { tx = 18;  ty = 14; rot = 2;  z = 5;  op = 0.65; sc = 0.95; }
                        if (isPrev)   { tx = -18; ty = 14; rot = -2; z = 5;  op = 0.65; sc = 0.95; }

                        return (
                          <div key={templateName} onClick={() => !isActive && handleSelectTemplate(index)} style={{
                            position: "absolute", inset: 0, zIndex: z,
                            transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${sc})`,
                            opacity: op,
                            transition: "all 0.38s cubic-bezier(0.34,1.4,0.64,1)",
                            cursor: isActive ? "default" : "pointer",
                            borderRadius: 14, border: `2px solid ${isActive ? C.primary : C.border}`,
                            background: C.surface,
                            boxShadow: isActive ? "0 8px 32px rgba(79,70,229,0.15)" : "0 2px 8px rgba(15,23,42,0.06)",
                            overflow: "hidden",
                          }}>
                            <div style={{ height: 28, display: "flex", alignItems: "center", gap: 5, padding: "0 12px", background: "#f1f5f9", borderBottom: `1px solid ${C.border}` }}>
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171" }} />
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24" }} />
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399" }} />
                              <div style={{ marginLeft: 8, height: 14, width: 130, borderRadius: 4, background: "rgba(255,255,255,0.9)" }} />
                              {isActive && <div style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: 4, background: C.primary, color: "#fff", fontSize: 9, fontWeight: 700 }}>SELECTED</div>}
                            </div>
                            <div style={{ background: "#dde3ee", padding: 10, height: "calc(100% - 28px)" }}>
                              <div style={{ height: "100%", borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}`, background: C.surface, maxWidth: deviceMode === "mobile" ? 260 : "none", margin: deviceMode === "mobile" ? "0 auto" : 0 }}>
                                {isActive ? (
                                  <iframe key={`${templateName}-${previewKey}`} title={`preview-${templateName}`} src={buildPreviewUrl(templateName)} style={{ width: "100%", height: "100%", border: "none", display: "block" }} />
                                ) : (
                                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <div style={{ textAlign: "center" }}>
                                      <div style={{ fontSize: 13, fontWeight: 700, color: C.inkMid }}>{toLabel(templateName)}</div>
                                      <div style={{ fontSize: 11, color: C.primary, marginTop: 10, fontWeight: 600 }}>Click to select</div>
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
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {templates.map((templateName, index) => {
                      const isSel = index === previewIndex;
                      return (
                        <button key={templateName} onClick={() => handleSelectTemplate(index)} style={{ flex: 1, minWidth: 80, padding: "8px 10px", borderRadius: 10, textAlign: "left", border: `1px solid ${isSel ? C.primary : C.border}`, background: isSel ? C.primaryLight : C.surface, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: isSel ? C.primary : C.border, flexShrink: 0 }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: isSel ? "#4338ca" : C.ink }}>{toLabel(templateName)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Device toggle */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: 4, borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, width: "fit-content", margin: "0 auto" }}>
                    {["desktop", "mobile"].map(mode => (
                      <button key={mode} onClick={() => setDeviceMode(mode)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 7, border: "none", background: deviceMode === mode ? C.primary : "transparent", color: deviceMode === mode ? "#fff" : C.inkMid, fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s", fontFamily: "inherit" }}>
                        {mode === "desktop"
                          ? <svg width="13" height="11" viewBox="0 0 13 11" fill="none"><rect x="0.65" y="0.65" width="11.7" height="8.2" rx="1.35" stroke="currentColor" strokeWidth="1.3"/><path d="M4 10.35h5M6.5 8.85v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                          : <svg width="9" height="13" viewBox="0 0 9 13" fill="none"><rect x="0.65" y="0.65" width="7.7" height="11.7" rx="1.85" stroke="currentColor" strokeWidth="1.3"/><circle cx="4.5" cy="10.2" r="0.6" fill="currentColor"/></svg>}
                        {mode}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
