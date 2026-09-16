"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardPaste, Loader2, Plus, X } from "lucide-react";
import { importSubscribersAction, addSubscriberAction, type ImportActionResult } from "@/app/actions/newsletter";

/**
 * Getting people onto the list.
 *
 * A paste box first, because the list exists somewhere already and the fast
 * path is select all, copy, paste. It reads one person per line in any of
 * the usual shapes and says exactly what it did: how many were added, how
 * many were already there, and every line it could not read, verbatim, so
 * they can be fixed rather than lost. A one at a time form sits beside it
 * for the person met at a showing.
 */

export function ImportBox() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ImportActionResult | null>(null);
  const [pending, start] = useTransition();
  const [single, setSingle] = useState(false);
  const [singleError, setSingleError] = useState<string | null>(null);
  const router = useRouter();

  function importList() {
    setResult(null);
    start(async () => {
      const r = await importSubscribersAction(text);
      setResult(r);
      if (r.success) {
        setText("");
        router.refresh();
      }
    });
  }

  function addOne(formData: FormData) {
    setSingleError(null);
    start(async () => {
      const r = await addSubscriberAction(formData);
      if (r.error) {
        setSingleError(r.error);
        return;
      }
      setSingle(false);
      router.refresh();
    });
  }

  const lines = text.split("\n").filter((l) => l.trim()).length;

  return (
    <section className="rounded-xl border border-line bg-surface p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-ink-3">Add people</h2>
        <button
          type="button"
          onClick={() => setSingle((s) => !s)}
          className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium text-signal-ink transition-colors hover:bg-white/[0.04]"
        >
          {single ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {single ? "Back to the paste box" : "Add one person"}
        </button>
      </div>

      {single ? (
        <form action={addOne} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field name="email" label="Email" type="email" required autoFocus />
            <Field name="firstName" label="First name" />
            <Field name="lastName" label="Last name" />
            <Field name="company" label="Brokerage or company" />
          </div>
          {singleError && (
            <p className="rounded-lg border border-red-500/25 bg-red-500/[0.07] px-3 py-2 text-xs text-red-300">{singleError}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-signal px-3.5 text-xs font-semibold text-white transition-colors hover:bg-[#3480d2] disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add to the list
          </button>
        </form>
      ) : (
        <>
          <p className="mb-3 text-xs leading-relaxed text-ink-3">
            One person per line. An address on its own works, and so does a name with it, a spreadsheet
            with a header row, or the To field copied out of an old email. Somebody who unsubscribed
            stays unsubscribed even if they are pasted again.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            spellCheck={false}
            placeholder={"heather@example.com\nKirstie Skul <kirstie@example.com>\npaula@example.com, Paula, Motte, RE/MAX"}
            aria-label="Paste the list"
            className="w-full rounded-lg border border-line bg-surface-hi p-3 font-mono text-xs leading-relaxed text-white outline-none transition-colors placeholder:text-ink-3 focus:border-line-strong"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={importList}
              disabled={pending || !text.trim()}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-signal px-3.5 text-xs font-semibold text-white transition-colors hover:bg-[#3480d2] disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardPaste className="h-4 w-4" />}
              Add {lines > 0 ? `${lines.toLocaleString()} ${lines === 1 ? "line" : "lines"}` : "the list"}
            </button>
            {result?.success && (
              <p className="text-xs text-emerald-300">
                {result.added} added
                {result.existing ? `, ${result.existing} already on file` : ""}
                {result.duplicates ? `, ${result.duplicates} repeated in the paste` : ""}
                {result.skipped?.length ? `, ${result.skipped.length} could not be read` : ""}.
              </p>
            )}
            {result?.error && <p className="text-xs text-red-300">{result.error}</p>}
          </div>
          {result?.skipped && result.skipped.length > 0 && (
            <div className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/[0.07] p-3">
              <p className="text-xs font-medium text-amber-200">
                No address found on {result.skipped.length === 1 ? "this line" : "these lines"}. Fix and paste again:
              </p>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-amber-100/80">
                {result.skipped.slice(0, 50).join("\n")}
                {result.skipped.length > 50 ? `\nand ${result.skipped.length - 50} more` : ""}
              </pre>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  autoFocus,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-ink-3">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoFocus={autoFocus}
        autoComplete="off"
        className="min-h-11 w-full min-w-0 rounded-lg border border-line bg-surface px-3 text-sm text-white outline-none transition-colors focus:border-line-strong"
      />
    </label>
  );
}
