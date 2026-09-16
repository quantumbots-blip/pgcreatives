"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CloudOff,
  Loader2,
  Plus,
  Send,
  FlaskConical,
  PenLine,
  Eye,
  ChevronDown,
  ChevronUp,
  Copy,
  Trash2,
  Image as ImageIcon,
  Heading2,
  AlignLeft,
  Columns2,
  Clapperboard,
  RectangleHorizontal,
  Quote,
  Minus,
  MoveVertical,
  Sparkles,
} from "lucide-react";
import {
  BLOCK_HINT,
  BLOCK_KINDS,
  BLOCK_LABEL,
  newBlock,
  type Block,
  type BlockKind,
  type Draft,
} from "@/lib/newsletter/blocks";
import type { CampaignSummary, DeliveryRow } from "@/lib/newsletter/db";
import type { CatalogFilm, CatalogPhoto } from "@/lib/newsletter/catalog";
import { saveCampaignAction, sendTestAction } from "@/app/actions/newsletter";
import { cn } from "@/lib/utils";
import { CampaignChip } from "../shared";
import { BlockFields } from "./block-editor";
import { Preview } from "./preview";
import { SendPanel, SentSummary } from "./send-panel";

/**
 * The editor.
 *
 * Two columns on a desktop: the words on the left, the email on the right,
 * updating as you type. On a phone the same two things are two tabs, since
 * neither is any use at half width. The email in the preview is the real
 * thing, rendered by the same code that renders the send, in an iframe so
 * the dashboard's own styles cannot leak into it.
 *
 * Drafts save themselves a moment after each change and the header says so.
 * An email that has gone out is shown read only with what happened to it.
 */

type SaveState = "saved" | "unsaved" | "saving" | "error";

const KIND_ICON: Record<BlockKind, React.ComponentType<{ className?: string }>> = {
  hero: ImageIcon,
  heading: Heading2,
  text: AlignLeft,
  image: ImageIcon,
  feature: Columns2,
  film: Clapperboard,
  button: RectangleHorizontal,
  quote: Quote,
  divider: Minus,
  spacer: MoveVertical,
};

export function Editor({
  campaign,
  deliveries,
  subscribers,
  photos,
  films,
  postalAddress,
  testAddress,
}: {
  campaign: CampaignSummary;
  deliveries: DeliveryRow[];
  subscribers: number;
  photos: CatalogPhoto[];
  films: CatalogFilm[];
  postalAddress: string | null;
  testAddress: string;
}) {
  const router = useRouter();
  const locked = campaign.status !== "draft";
  const [draft, setDraft] = useState<Draft>({
    subject: campaign.subject,
    preheader: campaign.preheader,
    blocks: campaign.blocks,
  });
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [sendOpen, setSendOpen] = useState(false);
  const [test, setTest] = useState<{ pending: boolean; note: string | null; error: string | null }>({
    pending: false,
    note: null,
    error: null,
  });
  const [adding, setAdding] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  /* Save a moment after the last keystroke. The state is set to unsaved in
     the change handler, not here, so the effect only ever schedules work;
     every keystroke restarts the timer, which is the debounce. */
  useEffect(() => {
    if (locked || saveState !== "unsaved") return;
    const timer = setTimeout(() => {
      setSaveState("saving");
      saveCampaignAction(campaign.id, draft).then((r) => {
        if (r.error) {
          setSaveError(r.error);
          setSaveState("error");
        } else {
          setSaveError(null);
          // Only "saved" if nothing changed while the request was out.
          setSaveState((s) => (s === "saving" ? "saved" : s));
        }
      });
    }, 700);
    return () => clearTimeout(timer);
  }, [draft, saveState, locked, campaign.id]);

  useEffect(() => {
    if (saveState === "saved") return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveState]);

  const update = useCallback(
    (fn: (d: Draft) => Draft) => {
      if (locked) return;
      setDraft((d) => fn(d));
      setSaveState("unsaved");
    },
    [locked],
  );

  const setBlock = useCallback(
    (id: string, patch: Partial<Block>) =>
      update((d) => ({
        ...d,
        blocks: d.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)),
      })),
    [update],
  );

  function addAt(index: number, kind: BlockKind) {
    const block = newBlock(kind);
    update((d) => {
      const blocks = [...d.blocks];
      blocks.splice(index, 0, block);
      return { ...d, blocks };
    });
    setAdding(null);
  }

  function move(index: number, dir: -1 | 1) {
    update((d) => {
      const blocks = [...d.blocks];
      const to = index + dir;
      if (to < 0 || to >= blocks.length) return d;
      [blocks[index], blocks[to]] = [blocks[to], blocks[index]];
      return { ...d, blocks };
    });
  }

  function duplicate(index: number) {
    update((d) => {
      const blocks = [...d.blocks];
      const copy = { ...blocks[index], id: newBlock(blocks[index].kind).id } as Block;
      blocks.splice(index + 1, 0, copy);
      return { ...d, blocks };
    });
  }

  function remove(id: string) {
    update((d) => ({ ...d, blocks: d.blocks.filter((b) => b.id !== id) }));
  }

  function toggleCollapsed(id: string) {
    setCollapsed((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function sendTest() {
    setTest({ pending: true, note: null, error: null });
    sendTestAction(campaign.id, draft).then((r) => {
      if (r.error) setTest({ pending: false, note: null, error: r.error });
      else setTest({ pending: false, note: `Sent to ${r.to}. Check the inbox in a minute.`, error: null });
    });
  }

  const saveLabel = useMemo(() => {
    switch (saveState) {
      case "saved":
        return { icon: Check, text: "Saved", className: "text-emerald-300" };
      case "unsaved":
        return { icon: PenLine, text: "Editing", className: "text-ink-3" };
      case "saving":
        return { icon: Loader2, text: "Saving", className: "text-ink-3" };
      case "error":
        return { icon: CloudOff, text: "Not saved", className: "text-red-300" };
    }
  }, [saveState]);
  const SaveIcon = saveLabel.icon;

  const subjectLen = draft.subject.length;
  const preheaderLen = draft.preheader.length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <Link
          href="/admin/newsletter"
          className="inline-flex min-h-9 items-center gap-1 text-xs text-ink-3 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Newsletter
        </Link>
        <CampaignChip status={campaign.status} />
        {!locked && (
          <span className={cn("inline-flex items-center gap-1 text-xs", saveLabel.className)} aria-live="polite">
            <SaveIcon className={cn("h-3.5 w-3.5", saveState === "saving" && "animate-spin")} />
            {saveLabel.text}
          </span>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={sendTest}
            disabled={test.pending}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line bg-surface-hi px-3 text-xs font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-white disabled:opacity-60"
            title={`Sends one copy to ${testAddress}`}
          >
            {test.pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
            Send me a test
          </button>
          {!locked && (
            <button
              type="button"
              onClick={() => setSendOpen(true)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-signal px-3.5 text-xs font-semibold text-white transition-colors hover:bg-[#3480d2]"
            >
              <Send className="h-4 w-4" />
              Review and send
            </button>
          )}
        </div>
      </div>
      {(test.note || test.error || saveError) && (
        <div className="mt-3 space-y-2">
          {test.note && <p className="text-xs text-emerald-300">{test.note}</p>}
          {test.error && (
            <p className="rounded-lg border border-red-500/25 bg-red-500/[0.07] px-3 py-2 text-xs text-red-300">{test.error}</p>
          )}
          {saveError && (
            <p className="rounded-lg border border-red-500/25 bg-red-500/[0.07] px-3 py-2 text-xs text-red-300">{saveError}</p>
          )}
        </div>
      )}

      {locked && (
        <div className="mt-5">
          <SentSummary campaign={campaign} deliveries={deliveries} />
        </div>
      )}

      {/* Phone tabs */}
      <div className="mt-5 flex rounded-lg border border-line bg-surface p-1 lg:hidden" role="tablist">
        {(["write", "preview"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors",
              tab === t ? "bg-[rgba(43,111,184,0.16)] text-signal-ink" : "text-ink-3 hover:text-ink-2",
            )}
          >
            {t === "write" ? <PenLine className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {t === "write" ? (locked ? "Content" : "Write") : "Preview"}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        {/* Left: the words */}
        <div className={cn("min-w-0 space-y-4", tab !== "write" && "hidden lg:block")}>
          <section className="rounded-xl border border-line bg-surface p-4 sm:p-5">
            <label className="block">
              <span className="mb-1 flex items-baseline justify-between text-[11px] uppercase tracking-[0.12em] text-ink-3">
                Subject line
                <span className={cn("normal-case tracking-normal tabular-nums", subjectLen > 60 && "text-amber-300")}>
                  {subjectLen}/60
                </span>
              </span>
              <input
                value={draft.subject}
                disabled={locked}
                onChange={(e) => update((d) => ({ ...d, subject: e.target.value }))}
                placeholder="What sold this month, and the shoot that did it"
                maxLength={200}
                className="min-h-11 w-full min-w-0 rounded-lg border border-line bg-surface-hi px-3 text-base text-white outline-none transition-colors placeholder:text-ink-3 focus:border-line-strong disabled:opacity-70 sm:text-sm"
              />
            </label>
            <label className="mt-3 block">
              <span className="mb-1 flex items-baseline justify-between text-[11px] uppercase tracking-[0.12em] text-ink-3">
                Preview text
                <span className={cn("normal-case tracking-normal tabular-nums", preheaderLen > 110 && "text-amber-300")}>
                  {preheaderLen}/110
                </span>
              </span>
              <input
                value={draft.preheader}
                disabled={locked}
                onChange={(e) => update((d) => ({ ...d, preheader: e.target.value }))}
                placeholder="The line the inbox shows under the subject"
                maxLength={200}
                className="min-h-11 w-full min-w-0 rounded-lg border border-line bg-surface-hi px-3 text-base text-white outline-none transition-colors placeholder:text-ink-3 focus:border-line-strong disabled:opacity-70 sm:text-sm"
              />
            </label>
            <p className="mt-2 text-[11px] leading-relaxed text-ink-3">
              Write <code className="rounded bg-white/[0.06] px-1 py-0.5 text-ink-2">{"{{first_name}}"}</code> anywhere
              and each person gets their own name, or &ldquo;there&rdquo; if the list has none for them.
            </p>
          </section>

          {draft.blocks.length === 0 && (
            <div className="rounded-xl border border-dashed border-line-strong px-4 py-10 text-center">
              <Sparkles className="mx-auto h-5 w-5 text-signal-ink" />
              <p className="mt-2 text-sm text-white">Empty so far.</p>
              <p className="mt-1 text-xs text-ink-3">Add an opening picture, then a heading and a paragraph.</p>
            </div>
          )}

          <ol className="space-y-3">
            {draft.blocks.map((block, index) => {
              const Icon = KIND_ICON[block.kind];
              const isCollapsed = collapsed.has(block.id);
              return (
                <li key={block.id} className="rounded-xl border border-line bg-surface">
                  <div className="flex items-center gap-1 px-2 py-1.5 sm:px-3">
                    <button
                      type="button"
                      onClick={() => toggleCollapsed(block.id)}
                      className="inline-flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 text-left text-xs font-medium text-white hover:bg-white/[0.04]"
                      aria-expanded={!isCollapsed}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-signal-ink" />
                      <span className="truncate">{BLOCK_LABEL[block.kind]}</span>
                      {isCollapsed && <span className="truncate font-normal text-ink-3">{summary(block)}</span>}
                    </button>
                    {!locked && (
                      <div className="flex shrink-0 items-center">
                        <IconButton label="Move up" onClick={() => move(index, -1)} disabled={index === 0}>
                          <ChevronUp className="h-4 w-4" />
                        </IconButton>
                        <IconButton label="Move down" onClick={() => move(index, 1)} disabled={index === draft.blocks.length - 1}>
                          <ChevronDown className="h-4 w-4" />
                        </IconButton>
                        <IconButton label="Duplicate" onClick={() => duplicate(index)}>
                          <Copy className="h-4 w-4" />
                        </IconButton>
                        <IconButton label="Remove" onClick={() => remove(block.id)} danger>
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="border-t border-line px-3 pb-4 pt-3 sm:px-4">
                      <BlockFields
                        block={block}
                        locked={locked}
                        photos={photos}
                        films={films}
                        onChange={(patch) => setBlock(block.id, patch)}
                      />
                    </div>
                  )}
                  {!locked && (
                    <AddRow
                      open={adding === index + 1}
                      onToggle={() => setAdding(adding === index + 1 ? null : index + 1)}
                      onPick={(kind) => addAt(index + 1, kind)}
                      between
                    />
                  )}
                </li>
              );
            })}
          </ol>

          {!locked && (
            <AddRow
              open={adding === draft.blocks.length && draft.blocks.length > 0 ? false : adding === -1}
              onToggle={() => setAdding(adding === -1 ? null : -1)}
              onPick={(kind) => addAt(draft.blocks.length, kind)}
            />
          )}
        </div>

        {/* Right: the email */}
        <div className={cn("min-w-0", tab !== "preview" && "hidden lg:block")}>
          <div className="lg:sticky lg:top-6">
            <Preview draft={draft} postalAddress={postalAddress} />
          </div>
        </div>
      </div>

      {sendOpen && (
        <SendPanel
          campaign={campaign}
          draft={draft}
          subscribers={subscribers}
          onClose={() => setSendOpen(false)}
          onDone={() => {
            setSendOpen(false);
            router.refresh();
          }}
        />
      )}
    </main>
  );
}

function summary(b: Block): string {
  switch (b.kind) {
    case "hero":
      return b.title || b.alt;
    case "heading":
      return b.text;
    case "text":
      return b.text.split("\n")[0];
    case "image":
      return b.alt || b.caption;
    case "feature":
      return b.title || b.text.split("\n")[0];
    case "film":
      return b.title;
    case "button":
      return b.label;
    case "quote":
      return b.text;
    case "divider":
      return "";
    case "spacer":
      return { s: "Small", m: "Medium", l: "Large" }[b.size];
  }
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-white/[0.05] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-3",
        danger && "hover:text-red-300",
      )}
    >
      {children}
    </button>
  );
}

function AddRow({
  open,
  onToggle,
  onPick,
  between,
}: {
  open: boolean;
  onToggle: () => void;
  onPick: (kind: BlockKind) => void;
  between?: boolean;
}) {
  return (
    <div className={cn(between ? "px-2 pb-2 sm:px-3" : "")}>
      {!open ? (
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg text-xs font-medium transition-colors",
            between
              ? "min-h-8 px-1.5 text-ink-3 hover:bg-white/[0.04] hover:text-ink-2"
              : "min-h-11 w-full justify-center border border-dashed border-line-strong text-ink-2 hover:border-signal-ink hover:text-white",
          )}
        >
          <Plus className="h-4 w-4" />
          {between ? "Add below" : "Add a block"}
        </button>
      ) : (
        <div className="rounded-lg border border-line bg-surface-hi p-2">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {BLOCK_KINDS.map((kind) => {
              const Icon = KIND_ICON[kind];
              return (
                <button
                  key={kind}
                  type="button"
                  onClick={() => onPick(kind)}
                  className="flex min-h-11 items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/[0.05]"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-signal-ink" />
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-white">{BLOCK_LABEL[kind]}</span>
                    <span className="block text-[11px] leading-snug text-ink-3">{BLOCK_HINT[kind]}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="mt-1 inline-flex min-h-9 items-center rounded-lg px-2 text-xs text-ink-3 hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
