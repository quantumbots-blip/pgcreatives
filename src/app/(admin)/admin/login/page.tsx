import { Lock } from "lucide-react";
import { googleConfigured, allowedEmails, FAILURE_MESSAGE } from "@/lib/google-auth";
import { PasswordForm } from "./password-form";
import { GoogleButton } from "./google-button";

export const dynamic = "force-dynamic";

/**
 * Two ways in, and only ever one of them at a time.
 *
 * With Google configured the password is not merely hidden here, it stops
 * working in the action too. Offering both would mean the dashboard's real
 * security stayed whatever the shared password's strength was, which is most
 * of what signing in with an account is meant to fix.
 */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const useGoogle = googleConfigured();
  const noAllowlist = useGoogle && allowedEmails().length === 0;
  const message = error ? (FAILURE_MESSAGE[error] ?? "That sign in did not work.") : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-ground px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface">
            <Lock className="h-6 w-6 text-signal-ink" />
          </div>
          <h1 className="display-2 !text-[clamp(1.5rem,3vw,2rem)] text-white">Admin access</h1>
          <p className="mt-2 text-sm text-ink-3">
            {useGoogle
              ? "Sign in with the Google account on the list."
              : "Enter your password to access the dashboard."}
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-red-500/25 bg-red-500/[0.07] px-4 py-3">
            <p className="text-sm text-red-400" aria-live="polite">
              {message}
            </p>
          </div>
        )}

        {useGoogle ? (
          <>
            <GoogleButton />
            {noAllowlist && (
              <p className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3 text-xs leading-relaxed text-amber-200">
                Nobody is on the allowlist yet, so no account can get in. Set ADMIN_ALLOWED_EMAILS
                to the Google address that should have access.
              </p>
            )}
          </>
        ) : (
          <PasswordForm />
        )}
      </div>
    </div>
  );
}
