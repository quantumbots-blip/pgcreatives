"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAction, type AuthState } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

/** The shared password, used only while Google sign in is not configured. */
const initialState: AuthState = { success: false, error: null };

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) router.push("/admin");
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="field-row">
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
          <p className="text-sm text-red-400" aria-live="polite">
            {state.error}
          </p>
        </div>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
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
  );
}
