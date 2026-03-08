import { TEMPLATE_LIBRARY } from "../templates/email";

export default function TemplateSelectionSection({ sectionRef, selectedTemplateId, onSelect, onNext }) {
  return (
    <section ref={sectionRef} className="px-8 py-10 lg:px-12">
      <div className="mx-auto max-w-[1280px] rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.6)]">
        <h3 className="text-3xl font-bold tracking-tight text-slate-900">Template Selection</h3>
        <p className="mt-2 text-sm text-slate-600">Choose the visual design for your campaign.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {TEMPLATE_LIBRARY.map((template) => {
            const selected = selectedTemplateId === template.id;

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelect(template.id)}
                className={`rounded-2xl border p-5 text-left transition ${
                  selected
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <span className="inline-flex h-2.5 w-14 rounded-full" style={{ backgroundColor: template.accent }} />
                <p className="mt-4 text-base font-semibold text-slate-900">{template.name}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{template.summary}</p>
                {selected ? (
                  <span className="mt-4 inline-block rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                    Selected
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onNext}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Next: Upload Contacts
          </button>
        </div>
      </div>
    </section>
  );
}
