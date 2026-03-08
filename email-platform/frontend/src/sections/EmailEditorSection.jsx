import { useMemo, useRef, useState } from "react";
import { renderEmailHtml } from "../templates/email";

// ─── Constants ────────────────────────────────────────────────────────────────
const PREVIEW_VARIANTS = [
  { id: "promo",        label: "Simple Promo",   subtitle: "High-conversion CTA",  templateId: "promo" },
  { id: "newsletter",   label: "Newsletter",     subtitle: "Content-first digest", templateId: "newsletter" },
  { id: "announcement", label: "Announcement",   subtitle: "Bold launch style",    templateId: "announcement" },
];

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary:       "#4f46e5",
  primaryHover:  "#4338ca",
  primaryLight:  "#eef2ff",
  primaryBorder: "#c7d2fe",
  primaryText:   "#4338ca",
  bg:            "#f8f9ff",
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

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, error, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: C.inkMid }}>
          {label}
        </label>
        {hint && <span style={{ fontSize: 11, color: C.inkSoft }}>{hint}</span>}
      </div>
      {children}
      {error && <span style={{ fontSize: 11, fontWeight: 500, color: C.red }}>{error}</span>}
    </div>
  );
}

// ─── Controlled input ─────────────────────────────────────────────────────────
function Input({ value, onChange, placeholder, hasError }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
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

function validate(subject, body) {
  const errors = {};
  if (!subject.trim()) errors.subject = "Subject is required.";
  else if (subject.trim().length < 6) errors.subject = "Subject must be at least 6 characters.";
  if (!body.trim()) errors.body = "Message body is required.";
  else if (body.trim().length < 40) errors.body = "Message body must be at least 40 characters.";
  return errors;
}

export default function EmailEditorSection({ sectionRef, campaign, onChange, onNext }) {
  const [deviceMode, setDeviceMode] = useState("desktop");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [feedback, setFeedback] = useState("Draft autosaves locally as you type.");
  const [taFocused, setTaFocused] = useState(false);

  const textareaRef = useRef(null);

  const errors = useMemo(() => validate(campaign.subject, campaign.body), [campaign.subject, campaign.body]);
  const canContinue = Object.keys(errors).length === 0;
  const wordCount = campaign.body.trim() ? campaign.body.trim().split(/\s+/).length : 0;

  const previewData = useMemo(() => ({
    subject: campaign.subject,
    preheader: campaign.preheader,
    body: campaign.body,
    ctaText: campaign.ctaText,
    ctaUrl: campaign.ctaUrl,
    companyName: campaign.campaignName,
  }), [campaign]);

  const renderedPreviews = useMemo(
    () => PREVIEW_VARIANTS.map((v) => renderEmailHtml(v.templateId, previewData)),
    [previewData],
  );

  function update(field, value) {
    onChange({ ...campaign, [field]: value });
  }

  function insertSnippet(snippet) {
    const el = textareaRef.current;
    if (!el) {
      update("body", campaign.body + snippet);
      return;
    }
    const s = el.selectionStart, e = el.selectionEnd;
    update("body", campaign.body.slice(0, s) + snippet + campaign.body.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + snippet.length, s + snippet.length);
    });
  }

  function handleNext() {
    setShowErrors(true);
    if (!canContinue) {
      setFeedback("Please fix validation issues before continuing.");
      return;
    }
    setFeedback("Looks good! Continuing to template selection.");
    onNext();
  }

  function handleReset() {
    update("campaignName", "Spring Collection Launch");
    update("fromEmail", "hello@rainbowdash.io");
    update("toEmail", "");
    update("subject", "Your early access to our new collection");
    update("preheader", "Limited preview for subscribers this week.");
    update("ctaText", "View Collection");
    update("ctaUrl", "https://example.com/new");
    update("body", "Hi {{first_name}},\n\nWe just launched a fresh set of products designed for growing teams. As a subscriber, you get early access before public release.\n\nTap the button below to explore the full collection and claim your launch offer.\n\nBest regards,\nRainbowDash Team");
    setShowErrors(false);
    setFeedback("Editor reset to default content.");
  }

  const currentVariant = PREVIEW_VARIANTS[previewIndex];

  return (
    <section ref={sectionRef} className="px-8 py-10 lg:px-12">
      <div className="mx-auto max-w-[1600px] rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.6)]">
        <h3 className="text-3xl font-bold tracking-tight text-slate-900">Email Content</h3>
        <p className="mt-2 text-sm text-slate-600">Fill in your campaign details and write your email copy.</p>

        {/* Main card */}
        <div style={{
          marginTop: 24,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 32px rgba(15,23,42,0.08)",
          display: "flex",
          minHeight: 700,
        }}>

          {/* ══ LEFT: Editor ════════════════════════════════════════════ */}
          <div style={{
            width: "50%",
            borderRight: `1px solid ${C.border}`,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}>
            {/* Scrollable form */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

              <Field label="Campaign Name">
                <Input value={campaign.campaignName} onChange={(e) => update("campaignName", e.target.value)} placeholder="e.g. Spring Collection Launch" />
              </Field>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Field label="From">
                    <Input value={campaign.fromEmail} onChange={(e) => update("fromEmail", e.target.value)} placeholder="hello@company.com" />
                  </Field>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Field label="To (optional)">
                    <Input value={campaign.toEmail} onChange={(e) => update("toEmail", e.target.value)} placeholder="recipient@company.com" />
                  </Field>
                </div>
              </div>

              <Field label="Subject Line" error={showErrors ? errors.subject : null}>
                <Input value={campaign.subject} onChange={(e) => update("subject", e.target.value)}
                  placeholder="Your compelling subject line…" hasError={showErrors && !!errors.subject} />
              </Field>

              <Field label="Preheader">
                <Input value={campaign.preheader} onChange={(e) => update("preheader", e.target.value)} placeholder="Preview text shown in inbox…" />
              </Field>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Field label="CTA Button Text">
                    <Input value={campaign.ctaText} onChange={(e) => update("ctaText", e.target.value)} placeholder="View Collection" />
                  </Field>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Field label="CTA URL">
                    <Input value={campaign.ctaUrl} onChange={(e) => update("ctaUrl", e.target.value)} placeholder="https://…" />
                  </Field>
                </div>
              </div>

              <Field label="Message Body" error={showErrors ? errors.body : null} hint={`${wordCount} words`}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {[
                    { label: "+ Greeting",   snippet: "Hi {{first_name}},\n\n" },
                    { label: "+ Promo Line", snippet: "\n\nUse code EARLY20 for 20% off." },
                    { label: "+ Signature",  snippet: "\n\nBest regards,\n{{business_name}}" },
                  ].map((s) => (
                    <button key={s.label} onClick={() => insertSnippet(s.snippet)} style={{
                      padding: "4px 10px", borderRadius: 6,
                      border: `1px solid ${C.primaryBorder}`,
                      background: C.primaryLight, color: C.primaryText,
                      fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    }}>{s.label}</button>
                  ))}
                </div>
                <textarea
                  ref={textareaRef}
                  rows={9}
                  value={campaign.body}
                  onChange={(e) => update("body", e.target.value)}
                  onFocus={() => setTaFocused(true)}
                  onBlur={() => setTaFocused(false)}
                  placeholder="Write your email copy here…"
                  style={{
                    width: "100%", padding: "10px 12px", fontSize: 13, lineHeight: 1.65,
                    border: `1px solid ${showErrors && errors.body ? C.redBorder : taFocused ? C.primary : C.border}`,
                    borderRadius: 10, outline: "none", resize: "none",
                    background: showErrors && errors.body ? C.redLight : taFocused ? C.surface : "#f8fafc",
                    color: C.ink,
                    boxShadow: taFocused ? `0 0 0 3px ${showErrors && errors.body ? "rgba(239,68,68,0.12)" : "rgba(79,70,229,0.12)"}` : "none",
                    transition: "all 0.15s", boxSizing: "border-box", fontFamily: "inherit",
                  }}
                />
              </Field>
            </div>

            {/* Footer */}
            <div style={{
              borderTop: `1px solid ${C.border}`,
              background: "rgba(248,250,252,0.9)",
              padding: "14px 28px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 12, color: C.inkSoft }}>{feedback}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleReset} style={{
                  padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
                  background: C.surface, color: C.inkMid, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}>Reset</button>
                <button onClick={handleNext} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 8, border: "none",
                  background: canContinue ? C.primary : "#cbd5e1",
                  color: "#fff", fontSize: 12, fontWeight: 700,
                  cursor: canContinue ? "pointer" : "not-allowed", fontFamily: "inherit",
                }}>
                  Next: Choose Template
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2.5 6.5h8M7.5 3l3 3.5-3 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ══ RIGHT: Preview ══════════════════════════════════════════ */}
          <div style={{
            width: "50%",
            background: C.panelBg,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}>
            <div style={{
              borderBottom: `1px solid ${C.border}`,
              background: "rgba(248,250,252,0.9)",
              padding: "14px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, letterSpacing: "-0.2px" }}>Preview</div>
                <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>
                  {currentVariant.label} — {currentVariant.subtitle}
                </div>
              </div>
              <div style={{
                padding: "3px 10px", borderRadius: 999, border: `1px solid ${C.border}`,
                background: C.surface, fontSize: 11, fontWeight: 600, color: C.inkMid,
              }}>
                {previewIndex + 1} / {PREVIEW_VARIANTS.length}
              </div>
            </div>

            <div style={{ flex: 1, padding: "20px 28px", display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Carousel */}
              <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                {/* Left arrow */}
                <button
                  onClick={() => setPreviewIndex((p) => (p - 1 + PREVIEW_VARIANTS.length) % PREVIEW_VARIANTS.length)}
                  aria-label="Previous"
                  style={{
                    position: "absolute", left: -14, top: "50%", transform: "translateY(-50%)",
                    zIndex: 20, width: 34, height: 34, borderRadius: "50%",
                    border: `1px solid ${C.border}`, background: C.surface,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "0 2px 8px rgba(15,23,42,0.08)", flexShrink: 0,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9 2.5L4 7l5 4.5" stroke={C.inkMid} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Right arrow */}
                <button
                  onClick={() => setPreviewIndex((p) => (p + 1) % PREVIEW_VARIANTS.length)}
                  aria-label="Next"
                  style={{
                    position: "absolute", right: -14, top: "50%", transform: "translateY(-50%)",
                    zIndex: 20, width: 34, height: 34, borderRadius: "50%",
                    border: `1px solid ${C.border}`, background: C.surface,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "0 2px 8px rgba(15,23,42,0.08)", flexShrink: 0,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 2.5l5 4.5-5 4.5" stroke={C.inkMid} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Stacked cards */}
                <div style={{ position: "relative", width: "100%", height: 420, margin: "0 10px" }}>
                  {PREVIEW_VARIANTS.map((variant, index) => {
                    const total  = PREVIEW_VARIANTS.length;
                    const offset = (index - previewIndex + total) % total;
                    const isActive = offset === 0;
                    const isNext   = offset === 1;
                    const isPrev   = offset === total - 1;

                    let tx = 0, ty = 0, rot = 0, z = 1, op = 0.3, sc = 0.90;
                    if (isActive) { tx = 0;   ty = 0;  rot = 0;    z = 10; op = 1;    sc = 1; }
                    if (isNext)   { tx = 18;  ty = 14; rot = 2;    z = 5;  op = 0.65; sc = 0.95; }
                    if (isPrev)   { tx = -18; ty = 14; rot = -2;   z = 5;  op = 0.65; sc = 0.95; }

                    return (
                      <div
                        key={variant.id}
                        onClick={() => !isActive && setPreviewIndex(index)}
                        style={{
                          position: "absolute", inset: 0, zIndex: z,
                          transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${sc})`,
                          opacity: op,
                          transition: "all 0.38s cubic-bezier(0.34,1.4,0.64,1)",
                          cursor: isActive ? "default" : "pointer",
                          borderRadius: 14,
                          border: `1px solid ${C.border}`,
                          background: C.surface,
                          boxShadow: isActive ? "0 8px 32px rgba(15,23,42,0.1)" : "0 2px 8px rgba(15,23,42,0.06)",
                          overflow: "hidden",
                        }}
                      >
                        {/* Browser chrome */}
                        <div style={{
                          height: 28, display: "flex", alignItems: "center", gap: 5,
                          padding: "0 12px", background: "#f1f5f9",
                          borderBottom: `1px solid ${C.border}`,
                        }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171" }} />
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24" }} />
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399" }} />
                          <div style={{ marginLeft: 8, height: 14, width: 130, borderRadius: 4, background: "rgba(255,255,255,0.9)" }} />
                        </div>
                        {/* Content */}
                        <div style={{ background: "#dde3ee", padding: 10, height: "calc(100% - 28px)" }}>
                          <div style={{
                            height: "100%", borderRadius: 8, overflow: "hidden",
                            border: `1px solid ${C.border}`, background: C.surface,
                            maxWidth: deviceMode === "mobile" ? 260 : "none",
                            margin: deviceMode === "mobile" ? "0 auto" : 0,
                          }}>
                            {isActive ? (
                              <iframe
                                title={`preview-${variant.id}`}
                                srcDoc={renderedPreviews[index]}
                                style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                              />
                            ) : (
                              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <div style={{ textAlign: "center" }}>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: C.inkMid }}>{variant.label}</div>
                                  <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 4 }}>{variant.subtitle}</div>
                                  <div style={{ fontSize: 11, color: C.primary, marginTop: 10, fontWeight: 600 }}>Click to preview</div>
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
              <div style={{ display: "flex", gap: 8 }}>
                {PREVIEW_VARIANTS.map((variant, index) => (
                  <button key={variant.id} onClick={() => setPreviewIndex(index)} style={{
                    flex: 1, padding: "8px 10px", borderRadius: 10, textAlign: "left",
                    border: `1px solid ${index === previewIndex ? C.primaryBorder : C.border}`,
                    background: index === previewIndex ? C.primaryLight : C.surface,
                    cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: index === previewIndex ? C.primary : C.border,
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: index === previewIndex ? C.primaryText : C.ink }}>
                        {variant.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: C.inkSoft, marginTop: 3, paddingLeft: 13 }}>
                      {variant.subtitle}
                    </div>
                  </button>
                ))}
              </div>

              {/* Device toggle */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 4, padding: 4, borderRadius: 10,
                border: `1px solid ${C.border}`, background: C.surface,
                width: "fit-content", margin: "0 auto",
              }}>
                {["desktop", "mobile"].map((mode) => (
                  <button key={mode} onClick={() => setDeviceMode(mode)} style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "6px 14px", borderRadius: 7, border: "none",
                    background: deviceMode === mode ? C.primary : "transparent",
                    color: deviceMode === mode ? "#fff" : C.inkMid,
                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                    textTransform: "capitalize", transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}>
                    {mode === "desktop" ? (
                      <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
                        <rect x="0.65" y="0.65" width="11.7" height="8.2" rx="1.35" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M4 10.35h5M6.5 8.85v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      <svg width="9" height="13" viewBox="0 0 9 13" fill="none">
                        <rect x="0.65" y="0.65" width="7.7" height="11.7" rx="1.85" stroke="currentColor" strokeWidth="1.3"/>
                        <circle cx="4.5" cy="10.2" r="0.6" fill="currentColor"/>
                      </svg>
                    )}
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
