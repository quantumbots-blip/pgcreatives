"use server";

import { cookies, headers } from "next/headers";
import { verifySessionFull } from "@/lib/auth";
import {
  saveSubscription,
  removeSubscription,
  pushConfigured,
  type PushSubscriptionInput,
} from "@/lib/push";

/**
 * Registering the owner's phone for lead alerts.
 *
 * Behind the admin session like everything else: a push subscription is a
 * direct line to somebody's lock screen, and anyone who could add one without
 * signing in could put whatever they liked on it.
 */

export type PushResult = { success?: true; error?: string };

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session) return false;
  return verifySessionFull(session.value);
}

function looksLikeSubscription(value: unknown): value is PushSubscriptionInput {
  if (!value || typeof value !== "object") return false;
  const v = value as PushSubscriptionInput;
  return (
    typeof v.endpoint === "string" &&
    /^https:\/\//.test(v.endpoint) &&
    v.endpoint.length < 1000 &&
    typeof v.keys?.p256dh === "string" &&
    typeof v.keys?.auth === "string"
  );
}

export async function subscribeAction(subscription: unknown): Promise<PushResult> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (!pushConfigured()) return { error: "Push is not configured on the server." };
  if (!looksLikeSubscription(subscription)) return { error: "That subscription looks wrong." };

  const hdrs = await headers();
  const userAgent = (hdrs.get("user-agent") ?? "").slice(0, 400) || null;

  try {
    await saveSubscription(subscription, userAgent);
    return { success: true };
  } catch (err) {
    console.error("[push] could not save subscription:", (err as Error).message);
    return { error: "Could not save this device." };
  }
}

export async function unsubscribeAction(endpoint: string): Promise<PushResult> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (typeof endpoint !== "string" || !endpoint.startsWith("https://")) {
    return { error: "Invalid device" };
  }
  try {
    await removeSubscription(endpoint);
    return { success: true };
  } catch {
    return { error: "Could not remove this device." };
  }
}
