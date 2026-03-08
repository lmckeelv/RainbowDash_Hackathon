import { useEffect, useMemo, useRef, useState } from "react";
import { C, DRAFT_KEY } from "../constants";
import { Field, Input, SectionCard } from "../components/UI";

const DEFAULT_DRAFT = {
  campaignName: "Spring Collection Launch",
  fromEmail:    "hello@rainbowdash.io",
  toEmail:      "",
  subject:      "Your early access to our new collection",
  preheader:    "Limited preview for subscribers this week.",
  ctaText:      "View Collection",
  ctaUrl:       "https://example.com/new",
  body:         "Hi {{first_name}},\n\nWe just launched a fresh set of products designed for growing teams. As a subscriber, you get early access before public release.\n\nTap the button below to explore the full collection and claim your launch offer.\n\nBest regards,\nRainbowDash Team",
};

function loadDraft() {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? { ...DEFAULT_DRAFT, ...JSON.parse(raw) } : DEFAULT_DRAFT;
  } catch { return DEFAULT_DRAFT; }
}

function validate({ subject, body }) {
  const e = {};
  if (!subject.trim()) e.subject = "Subject is required.";
  else if (subject.trim().length < 6) e.subject = "Must be at least 6 characters.";
  if (!body.trim()) e.body = "Body is required.";
  else if (body.trim().length < 40) e.body = "Must be at least 40 characters.";
  return e;
}

export default function EmailEditorSection({ id, onNext }) {
  const initial = loadDraft();
  const [campaignName, setCampaignName] = useState(initial.campaignName);
  const [fromEmail,    setFromEmail]    = useState(initial.fromEmail);
  const [toEmail,      setToEmail]      = useState(initial.toEmail);
  const [subject,      setSubject]      = useState(initial.subject);
  const [preheader,    setPreheader]    = useState(initial.preheader);
  const [ctaText,      setCtaText]      = useState(initial.ctaText);
  const [ctaUrl,       setCtaUrl]       = useState(initial.ctaUrl);
  const [body,         setBody]         = useState(initial.body);
  const [showErrors,   setShowErrors]   = useState(false);
  const [feedback,     setFeedback]     = useState("Draft autosaves as you type.");
  const [taFocused,    setTaFocused]    = useState(false);
  const textareaRef = useRef(null);

  const errors      = useMemo(() => validate({ subject, body }), [subject, body]);
  const canContinue = Object.keys(errors).length === 0;
  const wordCount   = body.trim() ? body.trim().split(/\s+/).length : 0;

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify({
        campaignName, fromEmail, toEmail, subject, preheader, ctaText, ctaUrl, body,
        updatedAt: new Date().toISOString(),
      }));
    } catch { /* ignore */ }
  }, [campaignName, fromEmail, toEmail, subject, preheader, ctaText, ctaUrl, body]);

  function insertSnippet(snippet) {
    const el = textareaRef.current;
    if (!el) { setBody((p) => p + snippet); return; }
    const s = el.selectionStart, e = el.selectionEnd;
    setBody(body.slice(0, s) + snippet + body.slice(e));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + snippet.length, s + snippet.length); });
  }

  function handleNext() {
    setShowErrors(true);
    if (!canContinue) { setFeedback("Please fix the validation issues."); return; }
    setFeedback("Saved! Moving to template selection.");
    onNext?.({ campaignName, fromEmail, toEmail, subject, preheader, ctaText, ctaUrl, body });
  }

  function handleReset() {
    setCampaignName(DEFAULT_DRAFT.campaignName); setFromEmail(DEFAULT_DRAFT.fromEmail);
    setToEmail(DEFAULT_DRAFT.toEmail);           setSubject(DEFAULT_DRAFT.subject);
    setPreheader(DEFAULT_DRAFT.preheader);       setCtaText(DEFAULT_DRAFT.ctaText);
    setCtaUrl(DEFAULT_DRAFT.ctaUrl);             setBody(DEFAULT_DRAFT.body);
    setShowErrors(false); setFeedback("Editor reset to defaults.");
  }

  return (
    <SectionCard id={id}>
      <div style={{
        borderBottom: `1px solid ${C.border}`, background: "rgba(248,250,252,0.9)",
        padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>Step 1: Email Content</div>
          <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>Fill in your campaign details and write your email copy.</div>
        </div>
      </div>

      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
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
            <Input value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="Your compelling subject line…" hasError={showErrors && !!errors.subject} />
          </Field>
          <Field label="Preheader">
            <Input value={preheader} onChange={(e) => setPreheader(e.target.value)} placeholder="Preview text shown in inbox…" />
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="CTA Button Text">
            <Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="View Collection" />
          </Field>
          <Field label="CTA URL">
            <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://…" />
          </Field>
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
                border: `1px solid ${C.primaryBorder}`, background: C.primaryLight,
                color: C.primaryText, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}>{s.label}</button>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onFocus={() => setTaFocused(true)}
            onBlur={() => setTaFocused(false)}
            placeholder="Write your email copy here…"
            style={{
              width: "100%", padding: "10px 12px", fontSize: 13, lineHeight: 1.65,
              border: `1px solid ${showErrors && errors.body ? C.redBorder : taFocused ? C.primary : C.border}`,
              borderRadius: 10, outline: "none", resize: "vertical",
              background: showErrors && errors.body ? C.redLight : taFocused ? C.surface : "#f8fafc",
              color: C.ink,
              boxShadow: taFocused
                ? `0 0 0 3px ${showErrors && errors.body ? "rgba(239,68,68,0.12)" : "rgba(79,70,229,0.12)"}`
                : "none",
              transition: "all 0.15s", boxSizing: "border-box", fontFamily: "inherit",
            }}
          />
        </Field>
      </div>

      <div style={{
        borderTop: `1px solid ${C.border}`, background: "rgba(248,250,252,0.9)",
        padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
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
            padding: "9px 18px", borderRadius: 8, border: "none",
            background: canContinue ? C.primary : "#cbd5e1",
            color: "#fff", fontSize: 13, fontWeight: 700,
            cursor: canContinue ? "pointer" : "not-allowed", fontFamily: "inherit",
            boxShadow: canContinue ? "0 2px 12px rgba(79,70,229,0.25)" : "none",
            transition: "all 0.15s",
          }}>
            Next: Choose Template
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2.5 6.5h8M7.5 3l3 3.5-3 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </SectionCard>
  );
}