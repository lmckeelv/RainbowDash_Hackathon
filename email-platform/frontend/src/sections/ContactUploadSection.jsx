import { useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmails(text) {
  return text
    .split(/[\n,;\t ]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .filter((email) => EMAIL_REGEX.test(email));
}

async function readFiles(fileList) {
  const files = Array.from(fileList || []);
  const fileNames = files.map((file) => file.name);
  const unique = new Set();

  for (const file of files) {
    const content = await file.text();
    parseEmails(content).forEach((email) => unique.add(email));
  }

  return {
    listCount: files.length,
    fileNames,
    totalContacts: unique.size,
    sampleContacts: Array.from(unique).slice(0, 8),
  };
}

export default function ContactUploadSection({ sectionRef, contactSummary, onUpdate, onNext }) {
  const [error, setError] = useState("");

  async function handleFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    const summary = await readFiles(fileList);
    if (summary.totalContacts === 0) {
      setError("No valid emails found in uploaded files.");
      return;
    }

    setError("");
    onUpdate(summary);
  }

  return (
    <section ref={sectionRef} className="px-8 py-10 lg:px-12">
      <div className="mx-auto max-w-[1280px] rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.6)]">
        <h3 className="text-3xl font-bold tracking-tight text-slate-900">Contact Upload</h3>
        <p className="mt-2 text-sm text-slate-600">Upload one or multiple CSV/TXT files containing recipient email addresses.</p>

        <div
          className="mt-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleFiles(event.dataTransfer.files);
          }}
        >
          <p className="text-sm font-medium text-slate-700">Drag and drop contact files here</p>
          <p className="mt-1 text-xs text-slate-500">or upload CSV/TXT files</p>

          <label className="mt-4 inline-flex cursor-pointer items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            Upload Contacts
            <input
              type="file"
              multiple
              accept=".csv,.txt,text/csv,text/plain"
              className="hidden"
              onChange={(event) => handleFiles(event.target.files)}
            />
          </label>
        </div>

        {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Contact Lists</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{contactSummary.listCount}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Total Contacts</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{contactSummary.totalContacts}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Uploaded Files</p>
            <p className="mt-2 text-sm font-medium text-slate-700">{contactSummary.fileNames.join(", ") || "None"}</p>
          </div>
        </div>

        {contactSummary.sampleContacts.length > 0 ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">Sample Contacts</p>
            <p className="mt-2 text-sm text-emerald-900">{contactSummary.sampleContacts.join(", ")}</p>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onNext}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={contactSummary.totalContacts === 0}
          >
            Next: Preview & Send
          </button>
        </div>
      </div>
    </section>
  );
}
