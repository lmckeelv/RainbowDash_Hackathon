export default function TemplateSelector({ templates, selectedTemplateId, onSelect }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">Template Library</h2>
      <p className="text-sm text-slate-600">Choose a layout before previewing or exporting HTML.</p>

      <div className="grid gap-3 md:grid-cols-3">
        {templates.map((template) => {
          const isSelected = selectedTemplateId === template.id;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template.id)}
              className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                isSelected
                  ? "border-slate-900 bg-white shadow-sm"
                  : "border-orange-100 bg-orange-50/60 hover:border-orange-200 hover:bg-white"
              }`}
            >
              <span
                className="mb-3 inline-flex h-2.5 w-12 rounded-full"
                style={{ backgroundColor: template.accent }}
                aria-hidden="true"
              />

              <p className="text-sm font-semibold text-slate-900">{template.name}</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">{template.summary}</p>

              {isSelected ? (
                <span className="mt-3 inline-block rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white">
                  Selected
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
