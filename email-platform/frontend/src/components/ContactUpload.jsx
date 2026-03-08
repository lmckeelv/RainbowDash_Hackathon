import { useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function extractEmails(rawText) {
  const tokens = rawText
    .split(/[\n,;\t ]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const unique = [];
  const seen = new Set();

  tokens.forEach((token) => {
    const normalized = token.toLowerCase();
    if (!EMAIL_REGEX.test(normalized) || seen.has(normalized)) return;

    seen.add(normalized);
    unique.push(normalized);
  });

  return unique;
}

export default function ContactUpload({ uploadSummary, onUploadComplete }) {
  const [error, setError] = useState("");

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileText = await file.text();
      const emails = extractEmails(fileText);

      if (emails.length === 0) {
        setError("No valid email addresses were found in the file.");
        onUploadComplete(null);
        return;
      }

      onUploadComplete({
        fileName: file.name,
        totalContacts: emails.length,
        sampleContacts: emails.slice(0, 5),
      });

      setError("");
    } catch {
      setError("Unable to read file. Please try another CSV or TXT file.");
      onUploadComplete(null);
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-orange-100 bg-white p-4">
      <h2 className="text-base font-semibold text-slate-900">Recipient Upload</h2>
      <p className="text-sm text-slate-600">
        Upload a <span className="font-medium">.csv</span> or <span className="font-medium">.txt</span> list
        of recipients.
      </p>

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100">
        <span>Upload Contacts</span>
        <input
          type="file"
          accept=".csv,.txt,text/csv,text/plain"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      {uploadSummary ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
          <p className="font-semibold">{uploadSummary.fileName}</p>
          <p className="mt-1">{uploadSummary.totalContacts} contacts detected.</p>
          <p className="mt-2 text-xs text-emerald-700">
            Sample: {uploadSummary.sampleContacts.join(", ")}
          </p>
        </div>
      ) : null}
    </section>
  );
}
