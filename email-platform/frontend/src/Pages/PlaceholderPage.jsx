export default function PlaceholderPage({ title, description }) {
  return (
    <main className="min-h-screen px-8 py-10 lg:px-16">
      <div className="mx-auto max-w-[1000px] rounded-3xl border border-slate-200 bg-white/90 p-10 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Page Placeholder</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
      </div>
    </main>
  );
}
