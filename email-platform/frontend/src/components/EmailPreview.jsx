export default function EmailPreview({
  htmlOutput,
  viewMode,
  copied,
  onViewModeChange,
  onCopyHtml,
  onDownloadHtml,
}) {
  return (
    <section className="space-y-4 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-orange-200 bg-orange-50 p-1">
          <button
            type="button"
            onClick={() => onViewModeChange("preview")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              viewMode === "preview"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Live Preview
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("html")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              viewMode === "html"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            HTML Output
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCopyHtml}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {copied ? "Copied" : "Copy HTML"}
          </button>

          <button
            type="button"
            onClick={onDownloadHtml}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Download HTML
          </button>
        </div>
      </div>

      {viewMode === "preview" ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <iframe
            title="Email preview"
            srcDoc={htmlOutput}
            className="h-[620px] w-full"
          />
        </div>
      ) : (
        <textarea
          readOnly
          value={htmlOutput}
          className="h-[620px] w-full rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-5 text-orange-100"
        />
      )}
    </section>
  );
}
