import { useMemo, useEffect, useState } from "react";

const EMAIL_DRAFT_KEY = "rd-email-editor-draft-v3";
const CONTACT_SUMMARY_KEYS = [
  "rd-contact-upload-summary-v1",
  "rd-contact-upload-v1",
  "rd-contacts-summary-v1",
];
const TEMPLATE_SELECTION_KEYS = [
  "rd-selected-template-v1",
  "rd-template-selection-v1",
];

function readJsonFromKeys(keys) {
  if (typeof window === "undefined") return null;
  for (const key of keys) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      return JSON.parse(raw);
    } catch { /* continue */ }
  }
  return null;
}

function formatTimestamp(isoValue) {
  if (!isoValue) return new Date().toLocaleString();
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return new Date().toLocaleString();
  return date.toLocaleString();
}

// ── Animated counting number ──────────────────────────────────────────────────
function CountUp({ target, duration = 1200 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    const steps = 40;
    const inc = target / steps;
    let current = 0;
    const id = setInterval(() => {
      current = Math.min(current + inc, target);
      setVal(Math.round(current));
      if (current >= target) clearInterval(id);
    }, duration / steps);
    return () => clearInterval(id);
  }, [target, duration]);
  return <>{val.toLocaleString()}</>;
}

// ── Smiley face SVG in 3D green style ────────────────────────────────────────
function SmileyIcon({ size = 96 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ballGrad" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="55%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </radialGradient>
        <radialGradient id="shineGrad" cx="40%" cy="25%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#15803d" floodOpacity="0.45" />
        </filter>
      </defs>
      {/* Ball */}
      <circle cx="48" cy="48" r="44" fill="url(#ballGrad)" filter="url(#shadow)" />
      {/* Shine */}
      <ellipse cx="38" cy="32" rx="18" ry="12" fill="url(#shineGrad)" />
      {/* Eyes */}
      <circle cx="34" cy="40" r="5" fill="white" opacity="0.95" />
      <circle cx="62" cy="40" r="5" fill="white" opacity="0.95" />
      <circle cx="35.5" cy="41" r="2.5" fill="#14532d" />
      <circle cx="63.5" cy="41" r="2.5" fill="#14532d" />
      {/* Smile */}
      <path
        d="M31 56 Q48 72 65 56"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
    </svg>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SuccessStatusPage({ navigate }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const summary = useMemo(() => {
    const draft    = readJsonFromKeys([EMAIL_DRAFT_KEY]) || {};
    const contacts = readJsonFromKeys(CONTACT_SUMMARY_KEYS) || {};
    const template = readJsonFromKeys(TEMPLATE_SELECTION_KEYS) || {};

    const totalRecipients =
      contacts.totalContacts ?? contacts.recipients ?? contacts.count ?? contacts.total ?? 248;
    const contactLists =
      contacts.listCount ?? contacts.filesUploaded ?? (totalRecipients > 0 ? 1 : 0);
    const errors = contacts.errors ?? contacts.failed ?? 0;

    return {
      campaignName:    draft.campaignName    || "Spring Collection Launch",
      subject:         draft.subject         || "Your early access to our new collection",
      fromEmail:       draft.fromEmail       || "hello@rainbowdash.io",
      templateName:    template.name || template.selectedTemplate || "Simple Promo",
      contactLists,
      totalRecipients,
      errors,
      sentAt: formatTimestamp(new Date().toISOString()),
    };
  }, []);

  // ── Shared style tokens
  const G = {
    green:       "#22c55e",
    greenDark:   "#16a34a",
    greenDeep:   "#15803d",
    greenLight:  "#f0fdf4",
    greenBorder: "#bbf7d0",
    teal:        "#0d9488",
    tealLight:   "#f0fdfa",
    tealBorder:  "#99f6e4",
    ink:         "#0f172a",
    inkMid:      "#475569",
    inkSoft:     "#94a3b8",
    border:      "#e2e8f0",
    surface:     "#ffffff",
    bg:          "linear-gradient(145deg, #dcfce7 0%, #f0fdf4 40%, #ecfdf5 70%, #d1fae5 100%)",
  };

  const cardEntry = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
    transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.34,1.3,0.64,1)",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: G.bg,
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 860,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        ...cardEntry,
      }}>

        {/* ── Main success card ─────────────────────────────────────────── */}
        <div style={{
          background: G.surface,
          borderRadius: 24,
          border: `1px solid ${G.greenBorder}`,
          boxShadow: "0 24px 64px rgba(21,128,61,0.12), 0 4px 16px rgba(21,128,61,0.08)",
          overflow: "hidden",
        }}>
          {/* Top green stripe */}
          <div style={{
            height: 6,
            background: `linear-gradient(90deg, ${G.green}, ${G.teal})`,
          }} />

          <div style={{ padding: "40px 48px" }}>
            {/* Icon + heading */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              {/* Smiley with ring */}
              <div style={{
                width: 120, height: 120, borderRadius: "50%",
                background: G.greenLight,
                border: `3px solid ${G.greenBorder}`,
                boxShadow: `0 0 0 10px rgba(34,197,94,0.1), 0 8px 32px rgba(21,128,61,0.2)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 28,
              }}>
                <SmileyIcon size={84} />
              </div>

              {/* Fancy heading */}
              <div style={{
                fontSize: 34, fontWeight: 900, letterSpacing: "-0.5px",
                background: `linear-gradient(135deg, ${G.greenDeep} 0%, ${G.teal} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: 12,
                lineHeight: 1.15,
              }}>
                Successfully Sent! 🎉
              </div>

              <p style={{ fontSize: 14, color: G.inkMid, maxWidth: 460, lineHeight: 1.7, marginBottom: 28 }}>
                Your campaign <strong style={{ color: G.ink }}>"{summary.campaignName}"</strong> was
                processed, previewed, and delivered to all your contacts without any issues.
              </p>

              {/* Big stat row */}
              <div style={{
                display: "flex", gap: 16, marginBottom: 32,
                flexWrap: "wrap", justifyContent: "center",
              }}>
                {/* Emails sent */}
                <div style={{
                  flex: "1 1 160px", minWidth: 140,
                  background: G.greenLight,
                  border: `1px solid ${G.greenBorder}`,
                  borderRadius: 16, padding: "20px 24px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 38, fontWeight: 900, color: G.greenDeep, lineHeight: 1 }}>
                    <CountUp target={summary.totalRecipients} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: G.greenDark, marginTop: 6 }}>
                    Emails Sent
                  </div>
                </div>

                {/* Contact lists */}
                <div style={{
                  flex: "1 1 160px", minWidth: 140,
                  background: G.tealLight,
                  border: `1px solid ${G.tealBorder}`,
                  borderRadius: 16, padding: "20px 24px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 38, fontWeight: 900, color: G.teal, lineHeight: 1 }}>
                    <CountUp target={summary.contactLists || 1} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: G.teal, marginTop: 6 }}>
                    Contact Lists
                  </div>
                </div>

                {/* Errors */}
                <div style={{
                  flex: "1 1 160px", minWidth: 140,
                  background: summary.errors > 0 ? "#fff7ed" : "#f8fafc",
                  border: `1px solid ${summary.errors > 0 ? "#fed7aa" : G.border}`,
                  borderRadius: 16, padding: "20px 24px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 38, fontWeight: 900, color: summary.errors > 0 ? "#ea580c" : G.inkSoft, lineHeight: 1 }}>
                    {summary.errors}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: summary.errors > 0 ? "#ea580c" : G.inkSoft, marginTop: 6 }}>
                    {summary.errors > 0 ? "Failed" : "No Errors ✓"}
                  </div>
                </div>
              </div>

              {/* Subject pill */}
              <div style={{
                width: "100%", maxWidth: 520,
                background: G.greenLight,
                border: `1px solid ${G.greenBorder}`,
                borderRadius: 12, padding: "12px 20px",
                display: "flex", alignItems: "center", gap: 10,
                marginBottom: 32,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: G.green, display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1.5 3.5h11l-5.5 5-5.5-5z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
                    <path d="M1.5 3.5v7h11v-7" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: G.greenDark }}>Subject</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: G.ink, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {summary.subject}
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <button
                  onClick={() => navigate?.("/email-editor")}
                  style={{
                    padding: "13px 28px", borderRadius: 12, border: "none",
                    background: `linear-gradient(135deg, ${G.green} 0%, ${G.teal} 100%)`,
                    color: "#fff", fontSize: 14, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                    boxShadow: "0 4px 16px rgba(34,197,94,0.4)",
                    display: "flex", alignItems: "center", gap: 8,
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(34,197,94,0.5)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(34,197,94,0.4)"; }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Create Another Campaign
                </button>

                <button
                  onClick={() => navigate?.("/dashboard")}
                  style={{
                    padding: "13px 28px", borderRadius: 12,
                    border: `1.5px solid ${G.greenBorder}`,
                    background: G.surface, color: G.greenDark,
                    fontSize: 14, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = G.greenLight; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = G.surface; }}
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Delivery detail strip ─────────────────────────────────────── */}
        <div style={{
          background: G.surface,
          borderRadius: 20,
          border: `1px solid ${G.greenBorder}`,
          boxShadow: "0 4px 20px rgba(21,128,61,0.07)",
          padding: "24px 32px",
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: G.greenDark, marginBottom: 16 }}>
            Delivery Details
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { label: "From",      value: summary.fromEmail },
              { label: "Template",  value: summary.templateName },
              { label: "Sent At",   value: summary.sentAt },
            ].map(({ label, value }) => (
              <div key={label} style={{
                flex: "1 1 200px", minWidth: 180,
                padding: "12px 16px", borderRadius: 12,
                border: `1px solid ${G.border}`, background: "#f8fafc",
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: G.inkSoft }}>
                  {label}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: G.ink, marginTop: 4 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}