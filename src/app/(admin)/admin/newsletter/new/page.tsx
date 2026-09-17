import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminNav } from "../../nav";
import { loadShell } from "../load-shell";
import { Chooser } from "./chooser";
import { postalAddress } from "@/lib/newsletter/send";

export const dynamic = "force-dynamic";

/**
 * Where an email starts. Five templates drawn live at a small size in the
 * chosen look, plus a blank one. Picking a card creates the email and
 * opens the editor on it.
 */

export default async function NewCampaignPage() {
  const { signedInAs, waiting } = await loadShell();
  return (
    <div className="min-h-screen bg-ground">
      <AdminNav waiting={waiting} signedInAs={signedInAs} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <Link
          href="/admin/newsletter"
          className="inline-flex items-center gap-1 text-xs text-ink-3 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Newsletter
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Start an email</h1>
        <p className="mt-1 max-w-xl text-sm text-ink-3">
          Each one is a finished email with real words and pictures, so you change what is different this
          month rather than fill in blanks. Every block can be moved, swapped or removed once it is open.
        </p>
        <Chooser postalAddress={postalAddress() ?? null} />
      </main>
    </div>
  );
}
