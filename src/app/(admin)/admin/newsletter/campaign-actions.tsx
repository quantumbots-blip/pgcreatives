"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Trash2, Loader2, PenLine } from "lucide-react";
import Link from "next/link";
import { deleteCampaignAction, duplicateCampaignAction } from "@/app/actions/newsletter";
import type { CampaignStatus } from "@/lib/newsletter/db";

/** Open, copy, and (for a draft) delete, with the delete asking once. */
export function CampaignActions({ id, status }: { id: number; status: CampaignStatus }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const small =
    "inline-flex min-h-9 items-center gap-1 rounded-lg border border-line px-2.5 text-xs text-ink-3 transition-colors hover:border-line-strong hover:text-white disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Link href={`/admin/newsletter/${id}`} className={small}>
        <PenLine className="h-3.5 w-3.5" />
        {status === "draft" ? "Edit" : "Open"}
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => { await duplicateCampaignAction(id); })}
        className={small}
        title="Make a copy to edit"
      >
        <Copy className="h-3.5 w-3.5" />
        Copy
      </button>
      {status === "draft" && !confirm && (
        <button type="button" onClick={() => setConfirm(true)} className={small} aria-label="Delete draft">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
      {confirm && (
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-2">
          Delete this draft?
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await deleteCampaignAction(id);
                if (r.error) setError(r.error);
                else router.refresh();
                setConfirm(false);
              })
            }
            className="inline-flex min-h-9 items-center rounded-lg bg-red-500/15 px-2.5 text-xs font-medium text-red-300 hover:bg-red-500/25"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Delete"}
          </button>
          <button type="button" onClick={() => setConfirm(false)} className={small}>
            Keep
          </button>
        </span>
      )}
      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}
