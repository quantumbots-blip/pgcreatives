"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { loginAction, type AuthState } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";

const initialState: AuthState = { success: false, error: null };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push("/admin");
    }
  }, [state.success, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface">
            <Lock className="h-6 w-6 text-signal-ink" />
          </div>
          <h1 className="display-2 !text-[clamp(1.5rem,3vw,2rem)] text-white">
            Admin access
          </h1>
          <p className="mt-2 text-sm text-ink-3">
            Enter your password to access the dashboard.
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          <div className="space-y-2.5">
            <Label htmlFor="password" className="field-label">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter admin password"
              required
              autoFocus
              className="field field-input"
            />
          </div>

          {state.error && (
            <div className="rounded-lg border border-red-500/25 bg-red-500/[0.07] px-4 py-3">
              <p className="text-sm text-red-400" aria-live="polite">{state.error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary w-full disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
