import { TEMPLATE_LIBRARY } from "../templates/email";

function formatDate(dateValue) {
  if (!dateValue) return "Not sent yet";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Not sent yet";
  return date.toLocaleString();
}

export default function SuccessStatusSection({
  sectionRef,
  sendStatus,
  campaign,
  contactSummary,
  selectedTemplateId,
  onRestart,
}) {
  const templateName =
    TEMPLATE_LIBRARY.find((template) => template.id === selectedTemplateId)?.name || "Simple Promo";

  return (
    <section ref={sectionRef} className="px-8 py-2 pb-14 lg:px-12">
      <div className="mx-auto max-w-[1280px] rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.6)]">
        <h3 className="text-3xl font-bold tracking-tight text-slate-900">Success Status</h3>

        {sendStatus.sent ? (
          <>
            <div className="mt-6 flex items-center gap-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
                <div className="relative h-9 w-9 rounded-full border-2 border-emerald-500">
                  <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="absolute bottom-2 left-1/2 h-2 w-4 -translate-x-1/2 rounded-b-full border-b-2 border-emerald-500" />
                </div>
              </div>

              <div>
                <p className="text-2xl font-bold text-slate-900">Emails sent successfully</p>
                <p className="mt-1 text-sm text-slate-700">
                  Uploaded emails were previewed and delivered with no blocking errors.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Subject</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{campaign.subject}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Contact Lists</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{contactSummary.listCount}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Recipients</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{contactSummary.totalContacts}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Template</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{templateName}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">From</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{campaign.fromEmail}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Sent At</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{formatDate(sendStatus.sentAt)}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onRestart}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Create Another Campaign
              </button>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-lg font-semibold text-slate-900">Waiting for send confirmation</p>
            <p className="mt-2 text-sm text-slate-600">
              Complete the Preview & Send section above, then this success summary will update automatically.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
