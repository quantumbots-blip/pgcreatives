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
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-purple/20 bg-purple/10">
            <Lock className="h-6 w-6 text-purple-light" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="mt-2 text-sm text-white/40">
            Enter your password to access the dashboard.
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          <div className="space-y-2.5">
            <Label htmlFor="password" className="text-xs font-medium uppercase tracking-[0.15em] text-white/50">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter admin password"
              required
              autoFocus
              className="h-12 rounded-lg border-purple/12 bg-purple/[0.03] text-white placeholder:text-white/20 focus:border-purple/40 focus:ring-1 focus:ring-purple/20"
            />
          </div>

          {state.error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
              <p className="text-sm text-red-400">{state.error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-dim via-purple to-purple-light px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition-all hover:brightness-110 disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
