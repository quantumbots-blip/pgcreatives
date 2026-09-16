"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2, RotateCcw, Send, X, Users, MailX, Play } from "lucide-react";
import type { Draft } from "@/lib/newsletter/blocks";
import type { CampaignSummary, DeliveryRow } from "@/lib/newsletter/db";
import type { Preflight } from "@/lib/newsletter/render";
import {
  preflightCampaignAction,
  retryFailedAction,
  sendCampaignAction,
  type SendActionResult,
} from "@/app/actions/newsletter";
import { Panel } from "../../ui";
import { shortDate } from "../shared";
import { cn } from "@/lib/utils";

/**
 * The last thing before it goes.
 *
 * A dialog that runs the checks, says who it is going to and how many, and
 * only then offers the button. Anything that would embarrass (no subject, a
 * picture with no description, nobody on the list) blocks it; anything
 * worth a second look (a long subject, a dash, no button) is shown and left
 * to the owner. The number on the button is the number of people.
 */

export function SendPanel({
  campaign,
  draft,
  subscribers,
  onClose,
  onDone,
}: {
  campaign: CampaignSummary;
  draft: Draft;
  subscribers: number;
  onClose: () => void;
  onDone: () => void;
}) {
  const [check, setCheck] = useState<{ preflight: Preflight; recipients: number } | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [result, setResult] = useState<SendActionResult | null>(null);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    preflightCampaignAction(campaign.id, draft).then((r) => {
      if (!live) return;
      if (r.error || !r.preflight) setCheckError(r.error ?? "Could not run the checks.");
      else setCheck({ preflight: r.preflight, recipients: r.recipients ?? subscribers });
    });
    return () => {
      live = false;
    };
    // The dialog checks what it was opened with; the draft is saved by then.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, pending]);

  function send() {
    start(async () => {
      const r = await sendCampaignAction(campaign.id, draft);
      setResult(r);
    });
  }

  const errors = check?.preflight.errors ?? [];
  const warnings = check?.preflight.warnings ?? [];
  const recipients = check?.recipients ?? subscribers;
  const canSend = check !== null && errors.length === 0 && !pending && !result;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6" onClick={() => !pending && onClose()}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Review and send"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl border border-line bg-surface sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-white">{result ? "Sent" : "Review and send"}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-3 hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {result ? (
            <Outcome result={result} />
          ) : (
            <>
              <div className="rounded-lg border border-line bg-surface-hi p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-ink-3">Subject</p>
                <p className="mt-1 break-words text-sm text-white">{draft.subject || <span className="text-ink-3">None yet</span>}</p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-ink-3">Going to</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-white">
                  <Users className="h-4 w-4 text-signal-ink" />
                  {recipients.toLocaleString()} {recipients === 1 ? "person" : "people"} on the list
                </p>
              </div>

              {!check && !checkError && (
                <p className="flex items-center gap-2 text-xs text-ink-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking the email
                </p>
              )}
              {checkError && <Note tone="error" items={[checkError]} />}
              {errors.length > 0 && <Note tone="error" title="Fix these first" items={errors} />}
              {warnings.length > 0 && <Note tone="warn" title="Worth a look" items={warnings} />}
              {check && errors.length === 0 && warnings.length === 0 && (
                <p className="flex items-center gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Nothing to fix.
                </p>
              )}

              <p className="text-[11px] leading-relaxed text-ink-3">
                Sending goes out in batches of a hundred. If the account&rsquo;s daily limit is reached part way,
                it pauses and can be resumed tomorrow; nobody gets it twice. Once sent, the email can no longer
                be edited.
              </p>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-4 py-3 sm:px-5">
          {result ? (
            <button
              type="button"
              onClick={onDone}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-signal px-3.5 text-xs font-semibold text-white hover:bg-[#3480d2]"
            >
              Done
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={pending}
                className="inline-flex min-h-10 items-center rounded-lg border border-line px-3 text-xs text-ink-2 hover:border-line-strong hover:text-white disabled:opacity-40"
              >
                Not yet
              </button>
              <button
                type="button"
                onClick={send}
                disabled={!canSend}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-signal px-3.5 text-xs font-semibold text-white hover:bg-[#3480d2] disabled:opacity-50"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {pending ? "Sending" : `Send to ${recipients.toLocaleString()}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Note({ tone, title, items }: { tone: "error" | "warn"; title?: string; items: string[] }) {
  const Icon = tone === "error" ? AlertCircle : AlertTriangle;
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        tone === "error" ? "border-red-500/25 bg-red-500/[0.07]" : "border-amber-500/25 bg-amber-500/[0.07]",
      )}
    >
      {title && (
        <p className={cn("mb-1.5 text-xs font-medium", tone === "error" ? "text-red-200" : "text-amber-200")}>{title}</p>
      )}
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className={cn("flex gap-2 text-xs leading-relaxed", tone === "error" ? "text-red-200" : "text-amber-100")}>
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Outcome({ result }: { result: SendActionResult }) {
  if (result.error) return <Note tone="error" items={[result.error]} />;
  const o = result.outcome!;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Figure label="Sent" value={o.sent} tone="good" />
        <Figure label="Failed" value={o.failed} tone={o.failed ? "bad" : undefined} />
        <Figure label="Waiting" value={o.remaining} tone={o.remaining ? "warn" : undefined} />
      </div>
      {o.status === "sent" && (
        <p className="flex items-center gap-2 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Everyone on the list has it.
        </p>
      )}
      {o.status === "paused" && <Note tone="warn" title="Paused" items={[o.reason ?? "Sending stopped early."]} />}
    </div>
  );
}

function Figure({ label, value, tone }: { label: string; value: number; tone?: "good" | "bad" | "warn" }) {
  return (
    <div className="rounded-lg border border-line bg-surface-hi p-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-ink-3">{label}</p>
      <p
        className={cn(
          "mt-1 text-xl font-bold tabular-nums",
          tone === "good" ? "text-emerald-300" : tone === "bad" ? "text-red-300" : tone === "warn" ? "text-amber-300" : "text-white",
        )}
      >
        {value.toLocaleString()}
      </p>
    </div>
  );
}

/**
 * What happened to an email that has gone out, or is part way out.
 */
export function SentSummary({ campaign, deliveries }: { campaign: CampaignSummary; deliveries: DeliveryRow[] }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const c = campaign.counts;
  const problems = deliveries.filter((d) => d.status === "failed" || d.status === "bounced" || d.status === "complained");

  function run(fn: () => Promise<SendActionResult>) {
    setError(null);
    start(async () => {
      const r = await fn();
      if (r.error) setError(r.error);
      router.refresh();
    });
  }

  return (
    <Panel
      title={campaign.status === "sent" ? `Sent ${shortDate(campaign.sent_at)}` : campaign.status === "paused" ? "Paused" : "Sending"}
      aside={
        (campaign.status === "paused" || campaign.status === "sending") && c.queued > 0 ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => sendCampaignAction(campaign.id, null))}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-signal px-3 text-xs font-semibold text-white hover:bg-[#3480d2] disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Resume, {c.queued.toLocaleString()} waiting
          </button>
        ) : c.failed > 0 ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => retryFailedAction(campaign.id))}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-medium text-ink-2 hover:border-line-strong hover:text-white disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Retry the {c.failed} failed
          </button>
        ) : null
      }
    >
      {campaign.status_reason && (
        <Note tone={campaign.status === "sent" ? "warn" : "warn"} items={[campaign.status_reason]} />
      )}
      {error && <div className="mt-3"><Note tone="error" items={[error]} /></div>}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        <Figure label="Sent" value={c.sent} tone="good" />
        <Figure label="Delivered" value={c.delivered} />
        <Figure label="Opened" value={c.opened} />
        <Figure label="Waiting" value={c.queued} tone={c.queued ? "warn" : undefined} />
        <Figure label="Failed" value={c.failed} tone={c.failed ? "bad" : undefined} />
        <Figure label="Bounced or spam" value={c.bounced + c.complained} tone={c.bounced + c.complained ? "bad" : undefined} />
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-ink-3">
        Delivered and opened only fill in once Resend&rsquo;s webhook is connected; see the checklist on the
        Newsletter page. Opens are undercounted in any case, since Apple Mail and Gmail hide them.
      </p>
      {problems.length > 0 && (
        <details className="mt-4">
          <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-ink-2 hover:text-white">
            <MailX className="h-4 w-4 text-red-300" />
            {problems.length} {problems.length === 1 ? "address" : "addresses"} with a problem
          </summary>
          <ul className="mt-2 divide-y divide-line rounded-lg border border-line">
            {problems.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-xs">
                <span className="text-white">{d.email}</span>
                <span className="text-ink-3">{d.status}</span>
                {d.error && <span className="basis-full text-ink-3 sm:basis-auto">{d.error}</span>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </Panel>
  );
}
