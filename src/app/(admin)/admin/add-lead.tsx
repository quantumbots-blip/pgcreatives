"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";
import { addLeadAction } from "@/app/actions/admin";

/**
 * Entering a lead that arrived some other way.
 *
 * The website form is not where most of this business starts. Instagram sends
 * more people to the site than Google does, and an agent who sees a reel is
 * far likelier to send a message or call than to fill in a form. Until now
 * none of those people existed as far as the dashboard was concerned, which
 * made the pipeline a record of one channel and quietly flattered the
 * response time figures by leaving out the calls.
 *
 * Only a first name and one way to reach them is required. Somebody typing
 * this while a caller is still on the line does not have a company name yet.
 */

const SERVICES = ["Real Estate", "Commercial", "Personal Brand", "Social Media"];
const SOURCES = [
  { value: "instagram.com", label: "Instagram" },
  { value: "phone", label: "Phone call" },
  { value: "facebook.com", label: "Facebook" },
  { value: "referral", label: "Referral" },
  { value: "", label: "Somewhere else" },
];

export function AddLead() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addLeadAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line bg-surface-hi px-3 text-xs font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-white"
      >
        <Plus className="h-4 w-4" />
        Add a lead
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-line bg-surface-hi p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Add a lead</h3>
          <p className="mt-0.5 text-xs text-ink-3">
            Someone who called or messaged, so they end up in the same pipeline.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          aria-label="Close"
          className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form action={submit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field name="firstName" label="First name" required autoFocus />
          <Field name="lastName" label="Last name" />
          <Field name="phone" label="Phone" type="tel" inputMode="tel" />
          <Field name="email" label="Email" type="email" />
          <Field name="company" label="Brokerage or company" />

          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-ink-3">
              Service
            </span>
            <select
              name="service"
              defaultValue=""
              className="min-h-11 w-full min-w-0 rounded-lg border border-line bg-surface px-3 text-sm text-white outline-none transition-colors focus:border-line-strong"
            >
              <option value="">Not sure yet</option>
              {SERVICES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-ink-3">
            How did they reach you
          </span>
          <select
            name="sourceReferrer"
            defaultValue="phone"
            className="min-h-11 w-full min-w-0 rounded-lg border border-line bg-surface px-3 text-sm text-white outline-none transition-colors focus:border-line-strong"
          >
            {SOURCES.map((s) => (
              <option key={s.label} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-ink-3">
            What they need
          </span>
          <textarea
            name="message"
            rows={3}
            maxLength={5000}
            placeholder="Property address, timing, anything they said on the call."
            className="w-full rounded-lg border border-line bg-surface p-3 text-sm text-white outline-none transition-colors placeholder:text-ink-3 focus:border-line-strong"
          />
        </label>

        {error && (
          <p className="rounded-lg border border-red-500/25 bg-red-500/[0.07] px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-signal bg-signal px-4 text-sm font-medium text-white transition-colors hover:bg-[#3179c4] disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? "Adding" : "Add lead"}
          </button>
          <p className="text-[11px] text-ink-3">Lands in Needs a reply.</p>
        </div>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  autoFocus,
  inputMode,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoFocus?: boolean;
  inputMode?: "tel" | "email" | "text";
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-ink-3">
        {label}
        {required && <span className="text-signal-ink"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        inputMode={inputMode}
        required={required}
        autoFocus={autoFocus}
        autoComplete="off"
        className="min-h-11 w-full min-w-0 rounded-lg border border-line bg-surface px-3 text-sm text-white outline-none transition-colors focus:border-line-strong"
      />
    </label>
  );
}
