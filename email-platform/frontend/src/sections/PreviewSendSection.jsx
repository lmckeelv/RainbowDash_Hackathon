import { useMemo } from "react";
import { renderEmailHtml, TEMPLATE_LIBRARY } from "../templates/email";

export default function PreviewSendSection({ sectionRef, campaign, selectedTemplateId, contactSummary, onSend }) {
  const html = useMemo(
    () =>
      renderEmailHtml(selectedTemplateId, {
        subject: campaign.subject,
        preheader: campaign.preheader,
        body: campaign.body,
        ctaText: campaign.ctaText,
        ctaUrl: campaign.ctaUrl,
        companyName: campaign.campaignName,
      }),
    [campaign, selectedTemplateId],
  );

  const templateName =
    TEMPLATE_LIBRARY.find((template) => template.id === selectedTemplateId)?.name || "Simple Promo";

  const canSend = campaign.subject.trim().length >= 6 && campaign.body.trim().length >= 40 && contactSummary.totalContacts > 0;

  return (
    <section ref={sectionRef} className="px-8 py-10 lg:px-12">
      <div className="mx-auto max-w-[1280px] rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.6)]">
        <h3 className="text-3xl font-bold tracking-tight text-slate-900">Preview and Send</h3>
        <p className="mt-2 text-sm text-slate-600">Final review before sending your campaign.</p>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <iframe title="final-email-preview" srcDoc={html} className="h-[620px] w-full" />
          </div>

          <aside className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Subject</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{campaign.subject}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Template</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{templateName}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Contact Lists</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{contactSummary.listCount}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Total Recipients</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{contactSummary.totalContacts}</p>
            </div>

            <button
              type="button"
              onClick={onSend}
              disabled={!canSend}
              className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Send Campaign
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}
