"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, PenLine, Trash2, UserMinus, UserPlus, X } from "lucide-react";
import { removeSubscriberAction, setSubscriberStatusAction, updateSubscriberAction } from "@/app/actions/newsletter";
import type { Subscriber } from "@/lib/newsletter/db";
import { SubscriberChip, shortDate } from "../shared";

/**
 * One row per person. The name and company can be corrected in place, a
 * person can be taken off the list in one press, and put back on in one
 * press too, since a phone call saying "actually, keep me on" happens.
 * Delete is for a bad paste, asks once, and is the only thing here that
 * forgets somebody entirely.
 */

export function SubscriberTable({ rows }: { rows: Subscriber[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line-strong px-4 py-10 text-center">
        <p className="text-sm text-white">Nobody here.</p>
        <p className="mt-1 text-xs text-ink-3">Paste the list above to get started, or clear the search.</p>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-line">
      {rows.map((s) => (
        <Row key={s.id} s={s} />
      ))}
    </ul>
  );
}

function Row({ s }: { s: Subscriber }) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const name = [s.first_name, s.last_name].filter(Boolean).join(" ");
  const small =
    "inline-flex min-h-9 items-center gap-1 rounded-lg border border-line px-2.5 text-xs text-ink-3 transition-colors hover:border-line-strong hover:text-white disabled:opacity-50";

  function run(fn: () => Promise<{ error?: string }>) {
    setError(null);
    start(async () => {
      const r = await fn();
      if (r.error) setError(r.error);
      else router.refresh();
    });
  }

  function save(formData: FormData) {
    run(async () => {
      const r = await updateSubscriberAction(s.id, {
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        company: String(formData.get("company") ?? ""),
      });
      if (!r.error) setEditing(false);
      return r;
    });
  }

  return (
    <li className="py-3 first:pt-0 last:pb-0">
      {editing ? (
        <form action={save} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          <Input name="firstName" label="First name" defaultValue={s.first_name} autoFocus />
          <Input name="lastName" label="Last name" defaultValue={s.last_name} />
          <Input name="company" label="Company" defaultValue={s.company} />
          <div className="flex gap-1.5">
            <button type="submit" disabled={pending} className={small} aria-label="Save">
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className={small} aria-label="Cancel">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="min-w-0 flex-1 basis-56">
            <p className="truncate text-sm text-white">
              {name || <span className="text-ink-3">No name</span>}
              {s.company && <span className="text-ink-3"> at {s.company}</span>}
            </p>
            <p className="truncate text-xs text-ink-3">
              {s.email}
              <span className="hidden sm:inline">
                {" "}
                · added {shortDate(s.created_at)}
                {s.last_sent_at ? `, last emailed ${shortDate(s.last_sent_at)}` : ""}
              </span>
            </p>
            {s.status !== "subscribed" && s.status_reason && (
              <p className="mt-0.5 truncate text-[11px] text-ink-3">{s.status_reason}</p>
            )}
          </div>
          <SubscriberChip status={s.status} />
          <div className="flex flex-wrap items-center gap-1.5">
            <button type="button" onClick={() => setEditing(true)} className={small} aria-label="Edit name">
              <PenLine className="h-3.5 w-3.5" />
            </button>
            {s.status === "subscribed" ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => setSubscriberStatusAction(s.id, "unsubscribed"))}
                className={small}
                title="Stop emailing this person"
              >
                <UserMinus className="h-3.5 w-3.5" />
                Take off
              </button>
            ) : (
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => setSubscriberStatusAction(s.id, "subscribed"))}
                className={small}
                title={
                  s.status === "complained"
                    ? "They marked an email as spam. Only put them back if they asked you to."
                    : "Start emailing this person again"
                }
              >
                <UserPlus className="h-3.5 w-3.5" />
                Put back
              </button>
            )}
            {!confirm ? (
              <button type="button" onClick={() => setConfirm(true)} className={small} aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-2">
                Forget them entirely?
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => removeSubscriberAction(s.id))}
                  className="inline-flex min-h-9 items-center rounded-lg bg-red-500/15 px-2.5 text-xs font-medium text-red-300 hover:bg-red-500/25"
                >
                  Delete
                </button>
                <button type="button" onClick={() => setConfirm(false)} className={small}>
                  Keep
                </button>
              </span>
            )}
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </li>
  );
}

function Input({
  name,
  label,
  defaultValue,
  autoFocus,
}: {
  name: string;
  label: string;
  defaultValue: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-ink-3">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        autoComplete="off"
        className="min-h-10 w-full min-w-0 rounded-lg border border-line bg-surface px-3 text-sm text-white outline-none transition-colors focus:border-line-strong"
      />
    </label>
  );
}
