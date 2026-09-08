import { Resend } from "resend";
import type { RenderedEmail } from "./layout";

/**
 * Sending, with the failure actually noticed.
 *
 * The Resend SDK does not throw when the API rejects a request. It resolves
 * with `{ data: null, error }`. Every call site here was written as
 * `try { await resend.emails.send(...) } catch`, which never fires, so a
 * rejected send looked exactly like a successful one.
 *
 * That is not a hypothetical. The sending domain was never verified, so every
 * lead notification this site has ever tried to send came back 403 and was
 * discarded without a line in the logs. Leads sat in the dashboard for months
 * while the owner was never told they existed.
 *
 * So: one place that sends, checks the returned error, and says so loudly.
 */

export type SendResult = { ok: true; id: string } | { ok: false; reason: string };

export async function sendEmail(options: {
  to: string;
  mail: RenderedEmail;
  /** Overrides the reply-to the template chose. */
  replyTo?: string;
  /** Named in the log line so a failure says which email it was. */
  kind: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, reason: "no RESEND_API_KEY" };

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: "PG Creatives <noreply@pgcreativeswi.com>",
      to: options.to,
      replyTo: options.replyTo ?? options.mail.replyTo,
      subject: options.mail.subject,
      html: options.mail.html,
      text: options.mail.text,
    });

    if (error) {
      /* The line that was missing. A rejected send is a real failure and
         has to be visible in the runtime logs, whatever the caller then
         decides to tell the visitor. */
      console.error(
        `[email] ${options.kind} to ${options.to} REJECTED by Resend:`,
        error.name,
        error.message,
      );
      return { ok: false, reason: `${error.name}: ${error.message}` };
    }

    if (!data?.id) {
      console.error(`[email] ${options.kind} returned no id and no error`);
      return { ok: false, reason: "no id returned" };
    }

    return { ok: true, id: data.id };
  } catch (err) {
    // A genuine transport failure, as opposed to an API rejection.
    console.error(`[email] ${options.kind} threw:`, (err as Error).message);
    return { ok: false, reason: (err as Error).message };
  }
}
