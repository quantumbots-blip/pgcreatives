"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, FilePlus2, Palette } from "lucide-react";
import { THEMES, THEME_LABEL, type ThemeId } from "@/lib/newsletter/blocks";
import { PALETTES, renderNewsletterHtml } from "@/lib/newsletter/render";
import { TEMPLATES } from "@/lib/newsletter/templates";
import { createCampaignAction } from "@/app/actions/newsletter";
import { cn } from "@/lib/utils";
import { Thumb } from "../thumb";

/**
 * The template cards, drawn from the same renderer that sends, so what is
 * on the card is what the email will be. Switching the look redraws every
 * card; the choice travels into the new email.
 */

const SAMPLE = {
  email: "you@example.com",
  firstName: "Heather",
  unsubscribeUrl: "https://pgcreativeswi.com/newsletter/unsubscribe/preview",
};

export function Chooser({ postalAddress }: { postalAddress: string | null }) {
  const [theme, setTheme] = useState<ThemeId | null>(null);
  const [pending, start] = useTransition();
  const [starting, setStarting] = useState<string | null>(null);

  const cards = useMemo(
    () =>
      TEMPLATES.map((t) => {
        const draft = { ...t.draft(), theme: theme ?? t.theme };
        return {
          t,
          theme: draft.theme,
          html: renderNewsletterHtml(draft, {
            recipient: SAMPLE,
            postalAddress: postalAddress ?? undefined,
            assetOrigin: "",
          }),
        };
      }),
    [theme, postalAddress],
  );

  function use(id: string, chosenTheme: ThemeId | undefined) {
    setStarting(id);
    start(async () => {
      await createCampaignAction(id, chosenTheme);
    });
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-ink-3">
          <Palette className="h-3.5 w-3.5" />
          Look
        </span>
        <div className="inline-flex flex-wrap rounded-lg border border-line bg-surface p-0.5" role="radiogroup" aria-label="Look">
          <button
            type="button"
            role="radio"
            aria-checked={theme === null}
            onClick={() => setTheme(null)}
            className={cn(
              "min-h-9 rounded-md px-3 text-xs font-medium transition-colors",
              theme === null ? "bg-[rgba(43,111,184,0.2)] text-signal-ink" : "text-ink-3 hover:text-ink-2",
            )}
          >
            As designed
          </button>
          {THEMES.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={theme === t}
              onClick={() => setTheme(t)}
              title={THEME_LABEL[t].hint}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors",
                theme === t ? "bg-[rgba(43,111,184,0.2)] text-signal-ink" : "text-ink-3 hover:text-ink-2",
              )}
            >
              <span
                className="h-3 w-3 rounded-sm border border-white/15"
                style={{ background: `linear-gradient(135deg, ${PALETTES[t].ground} 0 50%, ${PALETTES[t].accent} 50% 100%)` }}
                aria-hidden="true"
              />
              {THEME_LABEL[t].name}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ t, theme: cardTheme, html }) => (
          <li key={t.id} className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface">
            <button
              type="button"
              disabled={pending}
              onClick={() => use(t.id, theme ?? undefined)}
              className="group block text-left"
              aria-label={`Start from ${t.name}`}
            >
              <Thumb html={html} height={300} ground={PALETTES[cardTheme].ground} />
            </button>
            <div className="flex flex-1 flex-col p-4">
              <p className="text-sm font-semibold text-white">{t.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-2">{t.tagline}</p>
              <p className="mt-1 text-[11px] text-ink-3">{t.when}</p>
              <div className="mt-3 flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-ink-3">{THEME_LABEL[cardTheme].name}</span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => use(t.id, theme ?? undefined)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-signal px-3 text-xs font-semibold text-white hover:bg-[#3480d2] disabled:opacity-60"
                >
                  {pending && starting === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Use this
                </button>
              </div>
            </div>
          </li>
        ))}
        <li className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-line-strong p-6 text-center">
          <FilePlus2 className="h-5 w-5 text-signal-ink" />
          <p className="mt-2 text-sm font-semibold text-white">Blank</p>
          <p className="mt-1 max-w-[26ch] text-xs text-ink-3">Nothing in it but the header and the footer. Build it block by block.</p>
          <button
            type="button"
            disabled={pending}
            onClick={() => use("blank", theme ?? undefined)}
            className="mt-4 inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-medium text-ink-2 hover:border-line-strong hover:text-white disabled:opacity-60"
          >
            {pending && starting === "blank" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Start blank
          </button>
        </li>
      </ul>
    </div>
  );
}
