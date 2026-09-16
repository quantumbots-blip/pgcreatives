import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ensureSchema, logAuditEvent } from "@/lib/db";
import { BUSINESS } from "@/lib/data";
import { ensureNewsletterSchema, getSubscriberByToken, unsubscribeByToken } from "@/lib/newsletter/db";

export const dynamic = "force-dynamic";

/**
 * The page behind the Unsubscribe link in the footer.
 *
 * Opening the link does nothing on its own, because security scanners open
 * every link in a corporate inbox and would unsubscribe half a brokerage
 * before anybody read the email. The button does it, in one press, with no
 * account and no reason asked for. Then it says so, plainly, and offers the
 * way back in case it was a slip.
 */

async function unsubscribe(formData: FormData) {
  "use server";
  const token = String(formData.get("token") ?? "");
  await ensureSchema();
  await ensureNewsletterSchema();
  const sub = await unsubscribeByToken(token, "Unsubscribe link in the email");
  if (sub) {
    await logAuditEvent({ action: "newsletter_unsubscribed", targetTable: "newsletter_subscribers", targetId: sub.id, newValue: "link" });
  }
  /* Back to the same page, which now reads the new status. Without this the
     action returned and the page kept showing the button it had already
     honored. */
  redirect(`/newsletter/unsubscribe/${encodeURIComponent(token)}`);
}

export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const preview = token === "preview";

  let sub = null;
  if (!preview) {
    try {
      await ensureSchema();
      await ensureNewsletterSchema();
      sub = await getSubscriberByToken(token);
    } catch {
      sub = null;
    }
  }

  const done = sub && sub.status !== "subscribed";

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-10 inline-block">
          <Image src="/wordmark.png" alt="PG Creatives" width={176} height={37} priority className="h-[37px] w-[176px]" />
        </Link>

        {preview ? (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-white">This was a test copy</h1>
            <p className="mt-3 text-base leading-relaxed text-ink-2">
              The email you opened was sent from the editor as a test, so there is no list to leave. On the
              real thing this button removes one address, immediately, with nothing else asked.
            </p>
          </>
        ) : !sub ? (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-white">This link is no longer valid</h1>
            <p className="mt-3 text-base leading-relaxed text-ink-2">
              The address it belonged to is not on the list any more. If you are still getting emails from
              us, reply to one and say so, and we will sort it by hand.
            </p>
          </>
        ) : done ? (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-white">You are unsubscribed</h1>
            <p className="mt-3 text-base leading-relaxed text-ink-2">
              <span className="text-white">{sub.email}</span> will not get the newsletter again. Anything
              about a shoot you have booked still reaches you as normal.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-white">Stop the newsletter?</h1>
            <p className="mt-3 text-base leading-relaxed text-ink-2">
              One press takes <span className="text-white">{sub.email}</span> off the list. No account, no
              reason needed.
            </p>
            <form action={unsubscribe} className="mt-8">
              <input type="hidden" name="token" value={token} />
              <button type="submit" className="btn btn-primary min-h-12 w-full sm:w-auto">
                Unsubscribe
              </button>
            </form>
          </>
        )}

        <p className="mt-10 text-sm text-ink-3">
          PG Creatives, {BUSINESS.locationText}.{" "}
          <Link href="/" className="text-ink-2 underline underline-offset-4 hover:text-white">
            Back to the site
          </Link>
        </p>
      </div>
    </main>
  );
}
