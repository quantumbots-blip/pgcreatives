"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing, Loader2, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { subscribeAction, unsubscribeAction } from "@/app/actions/push";

/**
 * Turning on a buzz when a lead arrives.
 *
 * The state here is not ours to keep: whether this device is subscribed lives
 * in the browser, and it can change without us (notifications revoked in
 * settings, the app uninstalled). So it is read from the service worker
 * rather than remembered, every time this mounts.
 *
 * On iOS this only works once the dashboard has been added to the home
 * screen. Rather than offering a button that silently fails, that case is
 * detected and says so.
 */

type State =
  | "checking"
  | "unsupported"
  | "needs-install"
  | "blocked"
  | "off"
  | "on"
  | "working";

/**
 * Asks the browser where things stand. No React in here on purpose: this is
 * the "read the external system" half, and keeping it out of the component
 * means the effect can put the answer into state from a callback rather than
 * calling setState through a chain of function calls.
 */
async function readAlertState(): Promise<State> {
  const supported =
    "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

  if (!supported) {
    /* iOS only exposes PushManager to an installed web app, so this separates
       "your browser cannot" from "install it first". */
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    return isIOS && !installed ? "needs-install" : "unsupported";
  }

  if (Notification.permission === "denied") return "blocked";

  try {
    const reg = await navigator.serviceWorker.getRegistration("/sw.js");
    const existing = await reg?.pushManager.getSubscription();
    return existing ? "on" : "off";
  } catch {
    return "off";
  }
}

export function LeadAlerts({ vapidKey }: { vapidKey: string }) {
  const [state, setState] = useState<State>("checking");
  const [error, setError] = useState<string | null>(null);

  /* Whether this device is subscribed lives outside React and can change
     without us: permission revoked in settings, the app uninstalled, the
     subscription dropped by the push service. So it is always read on mount,
     never remembered across one. */
  useEffect(() => {
    let cancelled = false;
    readAlertState().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setError(null);
    setState("working");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "off");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      const result = await subscribeAction(JSON.parse(JSON.stringify(sub)));
      if (result.error) {
        setError(result.error);
        setState("off");
        return;
      }
      setState("on");
    } catch (err) {
      setError((err as Error).message || "Could not turn alerts on.");
      setState("off");
    }
  }

  async function disable() {
    setError(null);
    setState("working");
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await unsubscribeAction(sub.endpoint);
        await sub.unsubscribe();
      }
      setState("off");
    } catch {
      setState("off");
    }
  }

  if (state === "checking") return null;

  const shell =
    "flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3";

  if (state === "needs-install") {
    return (
      <div className={cn(shell, "border-line bg-surface")}>
        <Smartphone className="h-4 w-4 shrink-0 text-signal-ink" />
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-ink-2">
          Add this to your home screen first, then alerts can be turned on. Tap share, then Add to
          Home Screen. iPhones only allow notifications from an installed app.
        </p>
      </div>
    );
  }

  if (state === "unsupported") {
    return (
      <div className={cn(shell, "border-line bg-surface")}>
        <BellOff className="h-4 w-4 shrink-0 text-ink-3" />
        <p className="min-w-0 flex-1 text-xs text-ink-3">
          This browser cannot show lead alerts. The email still arrives.
        </p>
      </div>
    );
  }

  if (state === "blocked") {
    return (
      <div className={cn(shell, "border-amber-500/25 bg-amber-500/[0.07]")}>
        <BellOff className="h-4 w-4 shrink-0 text-amber-300" />
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-amber-200">
          Notifications are blocked for this site. Allow them in your browser settings, then
          reload.
        </p>
      </div>
    );
  }

  const on = state === "on";
  const busy = state === "working";

  return (
    <div
      className={cn(
        shell,
        on ? "border-[rgba(43,111,184,0.45)] bg-[rgba(43,111,184,0.08)]" : "border-line bg-surface",
      )}
    >
      {on ? (
        <BellRing className="h-4 w-4 shrink-0 text-signal-ink" />
      ) : (
        <Bell className="h-4 w-4 shrink-0 text-ink-3" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white">
          {on ? "Lead alerts are on for this device" : "Get a buzz when a lead comes in"}
        </p>
        <p className="mt-0.5 text-xs text-ink-3">
          {on
            ? "Tapping the notification opens the lead."
            : "Leads have sat here for months. This is the part that stops that."}
        </p>
        {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
      </div>
      <button
        type="button"
        onClick={on ? disable : enable}
        disabled={busy}
        className={cn(
          "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-4 text-xs font-medium transition-colors disabled:opacity-60",
          on
            ? "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-white"
            : "border-signal bg-signal text-white hover:bg-[#3179c4]",
        )}
      >
        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {busy ? "Working" : on ? "Turn off" : "Turn on alerts"}
      </button>
    </div>
  );
}
