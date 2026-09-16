"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Smartphone, Monitor, FileText } from "lucide-react";
import type { Draft } from "@/lib/newsletter/blocks";
import { renderNewsletterHtml, renderNewsletterText, type Recipient } from "@/lib/newsletter/render";
import { cn } from "@/lib/utils";

/**
 * The email, as it will arrive.
 *
 * Rendered in the browser by the same function the send uses, then put in
 * an iframe so nothing from the dashboard's stylesheet reaches it. A phone
 * width and a desktop width, because the two column block and the headline
 * size both change between them, plus the plain text twin, which is what a
 * watch or a screen reader gets.
 *
 * The sandbox allows same origin so the scroll position can be kept across
 * re-renders (every keystroke re-renders), but not scripts, and the email
 * carries none anyway.
 */

const SAMPLE: Recipient = {
  email: "you@example.com",
  firstName: "Heather",
  unsubscribeUrl: "https://pgcreativeswi.com/newsletter/unsubscribe/preview",
};

type Mode = "phone" | "desktop" | "text";

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function Preview({ draft, postalAddress }: { draft: Draft; postalAddress: string | null }) {
  const [mode, setMode] = useState<Mode>("phone");
  const settled = useDebounced(draft, 200);
  const frame = useRef<HTMLIFrameElement>(null);
  const scroll = useRef(0);

  const html = useMemo(
    () => renderNewsletterHtml(settled, { recipient: SAMPLE, postalAddress: postalAddress ?? undefined }),
    [settled, postalAddress],
  );
  const text = useMemo(
    () => renderNewsletterText(settled, { recipient: SAMPLE, postalAddress: postalAddress ?? undefined }),
    [settled, postalAddress],
  );
  const bytes = useMemo(() => new TextEncoder().encode(html).length, [html]);

  function remember() {
    try {
      scroll.current = frame.current?.contentWindow?.scrollY ?? scroll.current;
    } catch {
      // Cross origin in some browsers; then the scroll simply resets.
    }
  }
  function restore() {
    try {
      frame.current?.contentWindow?.scrollTo(0, scroll.current);
    } catch {
      // Same.
    }
  }

  const modes: { value: Mode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "phone", label: "Phone", icon: Smartphone },
    { value: "desktop", label: "Desktop", icon: Monitor },
    { value: "text", label: "Plain text", icon: FileText },
  ];

  return (
    <section className="rounded-xl border border-line bg-surface p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-lg border border-line bg-surface-hi p-0.5" role="tablist" aria-label="Preview as">
          {modes.map((m) => (
            <button
              key={m.value}
              type="button"
              role="tab"
              aria-selected={mode === m.value}
              onClick={() => setMode(m.value)}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors",
                mode === m.value ? "bg-[rgba(43,111,184,0.2)] text-signal-ink" : "text-ink-3 hover:text-ink-2",
              )}
            >
              <m.icon className="h-3.5 w-3.5" />
              {m.label}
            </button>
          ))}
        </div>
        <p className={cn("text-[11px] tabular-nums", bytes >= 90_000 ? "text-red-300" : "text-ink-3")}>
          {Math.round(bytes / 1024)}KB{bytes >= 90_000 ? ", Gmail will clip this" : ""}
        </p>
      </div>

      {mode === "text" ? (
        <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-line bg-surface-hi p-4 font-mono text-xs leading-relaxed text-ink-2">
          {text}
        </pre>
      ) : (
        <div
          className={cn(
            "mx-auto overflow-hidden rounded-[18px] border border-line-strong bg-[#07090c] transition-[max-width]",
            mode === "phone" ? "max-w-[390px]" : "max-w-[720px]",
          )}
        >
          <iframe
            ref={frame}
            key={mode}
            title="Email preview"
            srcDoc={html}
            sandbox="allow-same-origin"
            onLoad={restore}
            onMouseLeave={remember}
            onTouchEnd={remember}
            className={cn("block w-full border-0 bg-[#07090c]", mode === "phone" ? "h-[74vh] min-h-[560px]" : "h-[74vh] min-h-[640px]")}
          />
        </div>
      )}

      <p className="mt-2 text-[11px] leading-relaxed text-ink-3">
        Shown to a sample reader called Heather, so any {"{{first_name}}"} reads as a name here. The
        unsubscribe link in the footer is real on the sent copy and unique to each person.
      </p>
    </section>
  );
}
