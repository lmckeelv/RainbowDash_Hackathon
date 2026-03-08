const WIZARD_STEPS = [
  { num: "01", label: "Email Content" },
  { num: "02", label: "Choose Template" },
  { num: "03", label: "Upload Contacts" },
  { num: "04", label: "Preview & Send" },
];

export default function CampaignWizard({ activeStep }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 px-6 py-4 shadow-sm backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Campaign Builder</p>
      <h2 className="mt-1 text-xl font-bold text-slate-900">Create New Campaign</h2>

      <div className="mt-4 flex items-center">
        {WIZARD_STEPS.map((step, index) => {
          const isActive = index === activeStep;
          const isComplete = index < activeStep;

          return (
            <div key={step.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
                    isActive
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                      : isComplete
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {step.num}
                </div>
                <span
                  className={`mt-1.5 text-[11px] font-semibold whitespace-nowrap ${
                    isActive
                      ? "text-indigo-600"
                      : isComplete
                        ? "text-indigo-400"
                        : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < WIZARD_STEPS.length - 1 ? (
                <div
                  className={`mx-3 mb-4 h-px w-16 ${
                    index < activeStep ? "bg-indigo-300" : "bg-slate-200"
                  }`}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
