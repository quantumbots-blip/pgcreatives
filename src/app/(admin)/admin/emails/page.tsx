import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Mail, Eye, Send, AlertCircle } from "lucide-react";
import { verifySessionFull } from "@/lib/auth";
import { ensureSchema, getSubmissions } from "@/lib/db";
import { EMAIL_KINDS, KIND_LABEL, renderSample, type EmailKind } from "@/lib/email/templates";
import { cn } from "@/lib/utils";
import { AdminNav } from "../nav";
import { Panel } from "../ui";

export const dynamic = "force-dynamic";

/**
 * What the emails actually look like, on the real templates with real
 * sample data.
 *
 * An email is the one part of this that the owner cannot check by opening the
 * site, and the customer facing one has never been sent to anybody. Rendering
 * them in an iframe here means the wording can be read, argued with and
 * changed before a single one goes out.
 */

function parseKind(value: string | undefined): EmailKind {
  return EMAIL_KINDS.includes(value as EmailKind) ? (value as EmailKind) : "new_lead";
}

const DESCRIPTION: Record<EmailKind, { when: string; to: string; live: boolean }> = {
  new_lead: {
    when: "The moment somebody sends the contact form.",
    to: "You",
    live: true,
  },
  weekly_digest: {
    when: "Every Monday morning.",
    to: "You",
    live: true,
  },
  lead_confirmation: {
    when: "Straight back to whoever filled in the form.",
    to: "The customer",
    live: false,
  },
};

export default async function EmailPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || !(await verifySessionFull(session.value))) {
    redirect("/admin/login");
  }

  const kind = parseKind((await searchParams).kind);
  const mail = renderSample(kind);
  const meta = DESCRIPTION[kind];

  let waiting = 0;
  try {
    await ensureSchema();
    const subs = await getSubmissions();
    waiting = subs.filter((s) => (s.status || "new") === "new" || s.follow_up_due).length;
  } catch {
    // The preview does not need the database to be useful.
  }

  return (
    <div className="min-h-screen bg-ground">
      <AdminNav waiting={waiting} />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-center gap-2">
          {EMAIL_KINDS.map((k) => {
            const active = k === kind;
            return (
              <Link
                key={k}
                href={`/admin/emails?kind=${k}`}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors",
                  active
                    ? "bg-[rgba(43,111,184,0.16)] text-signal-ink"
                    : "text-ink-3 hover:bg-white/[0.04] hover:text-ink-2",
                )}
              >
                <Mail className="h-3.5 w-3.5" />
                {KIND_LABEL[k]}
              </Link>
            );
          })}
        </div>

        <Panel
          title={KIND_LABEL[kind]}
          aside={
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium",
                meta.live
                  ? "bg-emerald-500/12 text-emerald-300"
                  : "bg-amber-500/12 text-amber-300",
              )}
            >
              {meta.live ? "Sending now" : "Not switched on"}
            </span>
          }
        >
          <dl className="mb-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-line bg-surface-hi p-3">
              <dt className="text-[11px] uppercase tracking-[0.12em] text-ink-3">Goes to</dt>
              <dd className="mt-1 text-sm text-ink-2">{meta.to}</dd>
            </div>
            <div className="rounded-lg border border-line bg-surface-hi p-3 sm:col-span-2">
              <dt className="text-[11px] uppercase tracking-[0.12em] text-ink-3">Sent</dt>
              <dd className="mt-1 text-sm text-ink-2">{meta.when}</dd>
            </div>
          </dl>

          <div className="mb-5 rounded-lg border border-line bg-surface-hi p-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink-3">Subject line</p>
            <p className="mt-1 break-words text-sm text-white">{mail.subject}</p>
          </div>

          {!meta.live && (
            <div className="mb-5 flex gap-2.5 rounded-lg border border-amber-500/25 bg-amber-500/[0.07] p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <p className="text-xs leading-relaxed text-amber-200">
                Nothing has been sent to a customer. This is written and tested but switched off
                until you say otherwise, because it goes out under your name. Turning it on is one
                environment variable.
              </p>
            </div>
          )}

          {/* An iframe with the real html, so what is on screen is the email
              itself rather than a drawing of it. srcDoc keeps it same origin
              free: the sandbox allows nothing, so a template can never run
              anything in the dashboard. */}
          <div className="overflow-hidden rounded-lg border border-line bg-white">
            <iframe
              title={`${KIND_LABEL[kind]} preview`}
              srcDoc={mail.html}
              sandbox=""
              className="h-[760px] w-full border-0"
            />
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-3">
            <Eye className="h-3.5 w-3.5" />
            Rendered from the same template that sends. Resize the window to see the phone layout.
          </p>
        </Panel>

        <Panel
          title="The plain text version"
          note="Every email carries one. It is what a watch, a screen reader, or a client with images off shows, and some spam filters score a message without it."
        >
          <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-line bg-surface-hi p-4 font-mono text-xs leading-relaxed text-ink-2">
            {mail.text}
          </pre>
        </Panel>

        <Panel title="How they are sent">
          <ul className="space-y-3 text-sm leading-relaxed text-ink-2">
            <li className="flex gap-2.5">
              <Send className="mt-0.5 h-4 w-4 shrink-0 text-signal-ink" />
              <span>
                Through Resend, from{" "}
                <span className="text-white">noreply@pgcreativeswi.com</span>. A reply to a new lead
                email goes to the customer, not to that address.
              </span>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-signal-ink" />
              <span>
                Tables and inline styles rather than modern layout, because Outlook renders through
                Word and would drop anything else. That is why the code looks the way it does.
              </span>
            </li>
          </ul>
        </Panel>
      </main>
    </div>
  );
}
