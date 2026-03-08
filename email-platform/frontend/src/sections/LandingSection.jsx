const FEATURES = [
  "Write marketing emails in minutes",
  "Pick from high-performing templates",
  "Upload contacts and send at scale",
  "Track campaign status from one workflow",
];

export default function LandingSection({ sectionRef, onStart }) {
  return (
    <section ref={sectionRef} className="px-8 py-16 lg:px-12">
      <div className="mx-auto max-w-[1280px] rounded-3xl border border-slate-200 bg-white/90 p-10 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.55)]">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">RainbowDash Marketing Utility</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-bold tracking-tight text-slate-900">
          Send marketing emails in seconds
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          Build your campaign in one continuous flow: write content, choose design, upload contacts,
          preview, and send.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div key={feature} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {feature}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onStart}
          className="mt-8 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          Start Building Campaign
        </button>
      </div>
    </section>
  );
}
