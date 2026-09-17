"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Drag to reorder, with pointer events rather than HTML5 drag and drop.
 *
 * HTML5 drag does not exist on a phone, is cancelled by Chrome whenever the
 * dragged element re-renders, and cannot be driven by a test. Pointer
 * events work everywhere: the handle captures the pointer, every move is
 * compared against the items' boxes, and the release performs the move.
 * The page scrolls itself when the pointer nears an edge, so a long email
 * can be reordered end to end.
 *
 * `list` mode finds an insertion point (above or below an item); `grid`
 * mode finds the item under the pointer and swaps into its place.
 */
export function useReorder({
  mode,
  getItems,
  onMove,
}: {
  mode: "list" | "grid";
  /** The item elements, in order. */
  getItems: () => HTMLElement[];
  /** list: (from, insertAt). grid: (from, overIndex). */
  onMove: (from: number, to: number) => void;
}) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);
  const state = useRef<{ from: number; at: number | null } | null>(null);

  const locate = useCallback(
    (x: number, y: number): number | null => {
      const items = getItems();
      if (items.length === 0) return null;
      if (mode === "grid") {
        const hit = items.findIndex((el) => {
          const r = el.getBoundingClientRect();
          return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
        });
        return hit === -1 ? null : hit;
      }
      const first = items[0].getBoundingClientRect();
      if (y < first.top) return 0;
      for (let i = 0; i < items.length; i++) {
        const r = items[i].getBoundingClientRect();
        if (y >= r.top && y <= r.bottom) return y < r.top + r.height / 2 ? i : i + 1;
        const next = items[i + 1]?.getBoundingClientRect();
        if (next && y > r.bottom && y < next.top) return i + 1;
      }
      return items.length;
    },
    [getItems, mode],
  );

  const handleProps = useCallback(
    (index: number) => ({
      onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        state.current = { from: index, at: null };
        setDragging(index);
      },
      onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
        if (!state.current) return;
        const at = locate(e.clientX, e.clientY);
        state.current.at = at;
        setDropAt((d) => (d === at ? d : at));
        // Keep the page moving when the pointer is near the top or bottom.
        const edge = 72;
        if (e.clientY < edge) window.scrollBy(0, -14);
        else if (e.clientY > window.innerHeight - edge) window.scrollBy(0, 14);
      },
      onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
        const s = state.current;
        state.current = null;
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          // Already released.
        }
        setDragging(null);
        setDropAt(null);
        if (!s || s.at === null) return;
        if (mode === "list" ? s.at !== s.from && s.at !== s.from + 1 : s.at !== s.from) onMove(s.from, s.at);
      },
      onPointerCancel: () => {
        state.current = null;
        setDragging(null);
        setDropAt(null);
      },
      // The handle owns the gesture; without this a finger drag scrolls instead.
      style: { touchAction: "none" as const },
    }),
    [locate, mode, onMove],
  );

  return { dragging, dropAt, handleProps };
}
