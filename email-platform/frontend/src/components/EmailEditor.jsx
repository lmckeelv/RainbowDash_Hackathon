import { useEffect, useMemo, useRef, useState } from "react";

const DRAFT_STORAGE_KEY = "rd-email-editor-draft-v3";

const STEPS = [
  { num: "01", label: "Email Content" },
  { num: "02", label: "Choose Template" },
  { num: "03", label: "Preview & Send" },
];

const PREVIEW_VARIANTS = [
  { id: "promo", label: "Simple Promo", subtitle: "High-conversion CTA", templateId: "promo" },
  { id: "newsletter", label: "Newsletter", subtitle: "Content-first digest", templateId: "newsletter" },
  { id: "announcement", label: "Announcement", subtitle: "Bold launch style", templateId: "announcement" },
];

const DEFAULT_DRAFT = {
  campaignName: "Spring Collection Launch",
  fromEmail: "hello@rainbowdash.io",
  toEmail: "",
  subject: "Your early access to our new collection",
  preheader: "Limited preview for subscribers this week.",
  ctaText: "View Collection",
  ctaUrl: "https://example.com/new",
  body: "Hi {{first_name}},\n\nWe just launched a fresh set of products designed for growing teams. As a subscriber, you get early access before public release.\n\nTap the button below to explore the full collection and claim your launch offer.\n\nBest regards,\nRainbowDash Team",
};

const C = {
  primary: "#4f46e5",
  primaryLight: "#eef2ff",
  primaryBorder: "#c7d2fe",
  border: "#e2e8f0",
  surface: "#ffffff",
  panel: "#f8fafc",
  ink: "#0f172a",
  inkMid: "#475569",
  inkSoft: "#94a3b8",
  red: "#ef4444",
  redLight: "#fef2f2",
  redBorder: "#fecaca",
};

function loadDraft() {
  if (typeof window === "undefined") return DEFAULT_DRAFT;
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return DEFAULT_DRAFT;
    return { ...DEFAULT_DRAFT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_DRAFT;
  }
}

function validate(values) {
  const errors = {};
  if (!values.subject.trim()) errors.subject = "Subject is required.";
  else if (values.subject.trim().length < 6) errors.subject = "Subject must be at least 6 characters.";
  if (!values.body.trim()) errors.body = "Message body is required.";
  else if (values.body.trim().length < 40) errors.body = "Message body must be at least 40 characters.";
  return errors;
}

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderEmailHtml(templateId, data = {}) {
  const palette = {
    promo: { accent: "#4f46e5", soft: "#eef2ff" },
    newsletter: { accent: "#2563eb", soft: "#eff6ff" },
    announcement: { accent: "#7c3aed", soft: "#f5f3ff" },
  };

  const { accent, soft } = palette[templateId] || palette.promo;
  const subject = escapeHtml(data.subject || "Campaign Subject");
  const companyName = escapeHtml(data.companyName || "RainbowDash");
  const preheader = escapeHtml(data.preheader || "");
  const ctaText = escapeHtml(data.ctaText || "Learn More");
  const ctaUrl = escapeHtml(data.ctaUrl || "#");
  const body = (data.body || "")
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph) => `<p style=\"margin:0 0 14px;color:#334155;font-size:15px;line-height:1.7;\">${escapeHtml(paragraph).replaceAll("\n", "<br />")}</p>`)
    .join("");

  return `<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head><body style=\"margin:0;padding:24px;background:#f8fafc;font-family:Arial,sans-serif;\"><div style=\"display:none;opacity:0;max-height:0;overflow:hidden;\">${preheader}</div><table role=\"presentation\" style=\"width:100%;max-width:620px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;\"><tr><td style=\"background:${accent};padding:28px 30px;color:#fff;\"><div style=\"font-size:12px;opacity:.9;letter-spacing:.08em;text-transform:uppercase;\">${companyName}</div><h1 style=\"margin:10px 0 0;font-size:28px;line-height:1.2;\">${subject}</h1></td></tr><tr><td style=\"padding:26px 30px;\">${body || '<p style=\"margin:0;color:#475569;\">Start writing your email content.</p>'}<a href=\"${ctaUrl}\" style=\"display:inline-block;margin-top:10px;padding:12px 20px;border-radius:10px;background:${accent};color:#fff;text-decoration:none;font-weight:700;font-size:14px;\">${ctaText}</a></td></tr><tr><td style=\"padding:14px 30px;background:${soft};color:#64748b;font-size:12px;border-top:1px solid #e2e8f0;\">You are receiving this campaign email.</td></tr></table></body></html>`;
}

function StepIndicator({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {STEPS.map((step, index) => {
        const active = index === current;
        const complete = index < current;

        return (
          <div key={step.num} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  background: active ? C.primary : complete ? C.primaryLight : "#f1f5f9",
                  color: active ? "#fff" : complete ? C.primary : C.inkSoft,
                }}
              >
                {step.num}
              </div>
              <span
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: active ? C.primary : complete ? C.primary : C.inkSoft,
                  whiteSpace: "nowrap",
                }}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                style={{
                  width: 56,
                  height: 1,
                  margin: "0 10px 18px",
                  background: complete ? C.primaryBorder : C.border,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, hint, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.inkMid }}>
          {label}
        </label>
        {hint ? <span style={{ fontSize: 12, color: C.inkSoft }}>{hint}</span> : null}
      </div>
      {children}
      {error ? <span style={{ fontSize: 12, color: C.red, fontWeight: 600 }}>{error}</span> : null}
    </div>
  );
}

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
        width: "100%",
        padding: "10px 12px",
        fontSize: 14,
        borderRadius: 10,
        border: `1px solid ${hasError ? C.redBorder : focused ? C.primary : C.border}`,
        background: hasError ? C.redLight : focused ? C.surface : "#f8fafc",
        outline: "none",
        transition: "all 0.15s",
        boxSizing: "border-box",
        fontFamily: "inherit",
      }}
    />
  );
}

function SectionCard({ sectionRef, children }) {
  return (
    <section
      ref={sectionRef}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(15,23,42,0.07)",
      }}
    >
      {children}
    </section>
  );
}

export default function EmailEditor() {
  const initial = loadDraft();

  const [campaignName, setCampaignName] = useState(initial.campaignName);
  const [fromEmail, setFromEmail] = useState(initial.fromEmail);
  const [toEmail, setToEmail] = useState(initial.toEmail);
  const [subject, setSubject] = useState(initial.subject);
  const [preheader, setPreheader] = useState(initial.preheader);
  const [ctaText, setCtaText] = useState(initial.ctaText);
  const [ctaUrl, setCtaUrl] = useState(initial.ctaUrl);
  const [body, setBody] = useState(initial.body);

  const [previewIndex, setPreviewIndex] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [feedback, setFeedback] = useState("Draft autosaves locally as you type.");
  const [activeStep, setActiveStep] = useState(0);

  const contentRef = useRef(null);
  const templateRef = useRef(null);
  const sendRef = useRef(null);
  const textareaRef = useRef(null);

  const errors = useMemo(() => validate({ subject, body }), [subject, body]);
  const canContinue = Object.keys(errors).length === 0;
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  const previewData = useMemo(
    () => ({ subject, preheader, body, ctaText, ctaUrl, companyName: campaignName }),
    [subject, preheader, body, ctaText, ctaUrl, campaignName],
  );

  const previewHtml = useMemo(
    () => renderEmailHtml(PREVIEW_VARIANTS[previewIndex].templateId, previewData),
    [previewIndex, previewData],
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          campaignName,
          fromEmail,
          toEmail,
          subject,
          preheader,
          ctaText,
          ctaUrl,
          body,
          updatedAt: new Date().toISOString(),
        }),
      );
    } catch {
      // ignore localStorage errors
    }
  }, [campaignName, fromEmail, toEmail, subject, preheader, ctaText, ctaUrl, body]);

  useEffect(() => {
    const refs = [contentRef, templateRef, sendRef];

    function syncActiveStep() {
      let nearest = 0;
      let min = Number.POSITIVE_INFINITY;

      refs.forEach((ref, idx) => {
        if (!ref.current) return;
        const distance = Math.abs(ref.current.getBoundingClientRect().top - 170);
        if (distance < min) {
          min = distance;
          nearest = idx;
        }
      });

      setActiveStep(nearest);
    }

    syncActiveStep();
    window.addEventListener("scroll", syncActiveStep, { passive: true });
    return () => window.removeEventListener("scroll", syncActiveStep);
  }, []);

  function scrollTo(ref) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleTopNext() {
    if (activeStep === 0) {
      setShowErrors(true);
      if (!canContinue) {
        setFeedback("Please fix validation issues before continuing.");
        return;
      }
      scrollTo(templateRef);
      return;
    }

    if (activeStep === 1) {
      scrollTo(sendRef);
    }
  }

  function insertSnippet(snippet) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setBody((prev) => `${prev}${snippet}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = `${body.slice(0, start)}${snippet}${body.slice(end)}`;
    setBody(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + snippet.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(136deg,#e8eef9,#edf4f9)", fontFamily: "'Segoe UI',system-ui,-apple-system,sans-serif" }}>
      <header
        style={{
          borderBottom: `1px solid ${C.border}`,
          background: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(8px)",
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.inkSoft }}>
            Campaign Builder
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, color: C.ink, marginTop: 2 }}>Create New Campaign</div>
        </div>

        <StepIndicator current={activeStep} />

        <button
          type="button"
          onClick={handleTopNext}
          style={{
            border: "none",
            borderRadius: 10,
            padding: "10px 20px",
            background: "#cbd5e1",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Next ->
        </button>
      </header>

      <main style={{ maxWidth: 1380, margin: "0 auto", padding: "24px 32px", display: "grid", gap: 18 }}>
        <SectionCard sectionRef={contentRef}>
          <div style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(248,250,252,0.9)", padding: "16px 28px" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.ink }}>Step 1: Email Content</div>
            <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2 }}>Fill in your campaign details and write your email copy.</div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>Preview</div>
              <div style={{ fontSize: 14, color: C.inkSoft, marginTop: 2 }}>Simple Promo - High-conversion CTA</div>
            </div>
          </div>

          <div style={{ padding: "22px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Campaign Name">
              <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="e.g. Spring Collection Launch" />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="From">
                <Input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="hello@company.com" />
              </Field>
              <Field label="To (optional)">
                <Input value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder="recipient@company.com" />
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Subject Line" error={showErrors ? errors.subject : null}>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Your compelling subject line..." hasError={showErrors && !!errors.subject} />
              </Field>
              <Field label="Preheader">
                <Input value={preheader} onChange={(e) => setPreheader(e.target.value)} placeholder="Preview text shown in inbox..." />
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="CTA Button Text">
                <Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="View Collection" />
              </Field>
              <Field label="CTA URL">
                <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://..." />
              </Field>
            </div>

            <Field label="Message Body" hint={`${wordCount} words`} error={showErrors ? errors.body : null}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                <button type="button" onClick={() => insertSnippet("Hi {{first_name}},\n\n")} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.primaryBorder}`, background: C.primaryLight, color: C.primary, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ Greeting</button>
                <button type="button" onClick={() => insertSnippet("\n\nUse code EARLY20 for 20% off.")} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.primaryBorder}`, background: C.primaryLight, color: C.primary, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ Promo Line</button>
                <button type="button" onClick={() => insertSnippet("\n\nBest regards,\n{{business_name}}")}
                  style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.primaryBorder}`, background: C.primaryLight, color: C.primary, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ Signature</button>
              </div>

              <textarea
                ref={textareaRef}
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your email copy here..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: 13,
                  lineHeight: 1.65,
                  border: `1px solid ${showErrors && errors.body ? C.redBorder : C.border}`,
                  borderRadius: 10,
                  outline: "none",
                  resize: "vertical",
                  background: showErrors && errors.body ? C.redLight : "#f8fafc",
                  color: C.ink,
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </Field>
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, background: "rgba(248,250,252,0.9)", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: C.inkSoft }}>{feedback}</span>
            <button
              type="button"
              onClick={() => {
                setShowErrors(true);
                if (!canContinue) {
                  setFeedback("Please fix validation issues before continuing.");
                  return;
                }
                scrollTo(templateRef);
              }}
              style={{ border: "none", borderRadius: 8, padding: "9px 18px", background: canContinue ? C.primary : "#cbd5e1", color: "#fff", fontSize: 13, fontWeight: 700, cursor: canContinue ? "pointer" : "not-allowed", fontFamily: "inherit" }}
            >
              Next: Choose Template
            </button>
          </div>
        </SectionCard>

        <SectionCard sectionRef={templateRef}>
          <div style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(248,250,252,0.9)", padding: "16px 28px" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.ink }}>Step 2: Choose Template</div>
            <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2 }}>
              Preview - {PREVIEW_VARIANTS[previewIndex].label} - {PREVIEW_VARIANTS[previewIndex].subtitle}
            </div>
          </div>

          <div style={{ padding: "22px 28px" }}>
            <div style={{ overflow: "hidden", borderRadius: 14, border: `1px solid ${C.border}`, background: C.panel }}>
              <div style={{ height: 28, display: "flex", alignItems: "center", gap: 5, padding: "0 12px", background: "#f1f5f9", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171" }} />
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24" }} />
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399" }} />
              </div>
              <iframe title="template-preview" srcDoc={previewHtml} style={{ width: "100%", height: 560, border: "none", display: "block" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8, marginTop: 12 }}>
              {PREVIEW_VARIANTS.map((variant, idx) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setPreviewIndex(idx)}
                  style={{
                    padding: "9px 10px",
                    borderRadius: 10,
                    border: `1px solid ${idx === previewIndex ? C.primaryBorder : C.border}`,
                    background: idx === previewIndex ? C.primaryLight : C.surface,
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: idx === previewIndex ? C.primary : C.ink }}>{variant.label}</div>
                  <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>{variant.subtitle}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, background: "rgba(248,250,252,0.9)", padding: "14px 28px", display: "flex", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => scrollTo(sendRef)} style={{ border: "none", borderRadius: 8, padding: "9px 18px", background: C.primary, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Next: Preview & Send
            </button>
          </div>
        </SectionCard>

        <SectionCard sectionRef={sendRef}>
          <div style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(248,250,252,0.9)", padding: "16px 28px" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.ink }}>Step 3: Preview & Send</div>
            <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2 }}>This section is intentionally empty for now.</div>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ minHeight: 220, border: "2px dashed #cbd5e1", borderRadius: 14, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 14, color: C.inkSoft, fontWeight: 600 }}>Preview and send module will be added here.</span>
            </div>
          </div>
        </SectionCard>
      </main>
    </div>
  );
}
