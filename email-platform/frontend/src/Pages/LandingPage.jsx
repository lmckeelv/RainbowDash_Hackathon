const PAGE_CARDS = [
  {
    title: "Landing Page",
    path: "/",
    description: "Product intro and CTA to start a campaign.",
  },
  {
    title: "Dashboard / Campaign Page",
    path: "/dashboard",
    description: "Manage and review campaign drafts and status.",
  },
  {
    title: "Campaign Builder (Email Editor)",
    path: "/email-editor",
    description: "Write and validate the email content.",
  },
  {
    title: "Template Selection",
    path: "/template-selection",
    description: "Choose the visual email template.",
  },
  {
    title: "Contact Upload",
    path: "/contact-upload",
    description: "Import recipient list from CSV/TXT.",
  },
  {
    title: "Preview and Send",
    path: "/preview-send",
    description: "Final preview before sending to contacts.",
  },
  {
    title: "Success / Status",
    path: "/success-status",
    description: "Delivery result, sent count, and errors.",
  },
];

export default function LandingPage({ navigate }) {
  return (
    <main className="min-h-screen px-8 py-10 lg:px-16">
      <div className="mx-auto max-w-[1320px] space-y-8">
        <header className="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">RainbowDash Marketing Utility</p>
          <h1 className="mt-2 text-5xl font-bold tracking-tight text-slate-900">Send marketing emails in seconds</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Build campaigns, choose templates, upload contacts, preview, and send from one workflow.
          </p>
          <button
            type="button"
            onClick={() => navigate("/email-editor")}
            className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Create Campaign
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PAGE_CARDS.map((card) => (
            <button
              key={card.path}
              type="button"
              onClick={() => navigate(card.path)}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-slate-300 hover:shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">{card.title}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{card.path}</p>
              <p className="mt-3 text-sm text-slate-600">{card.description}</p>
            </button>
          ))}
        </section>
      </div>
    </main>
  );
}
