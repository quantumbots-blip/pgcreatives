"use client";

import { useEffect, useRef } from "react";

export function ServiceChart({
  data,
}: {
  data: { service: string; count: number }[];
}) {
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barsRef.current) return;
    const bars = barsRef.current.querySelectorAll<HTMLDivElement>("[data-bar]");
    // Trigger animation after mount
    const frame = requestAnimationFrame(() => {
      bars.forEach((bar) => {
        bar.style.width = bar.dataset.width || "0%";
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [data]);

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-ink-3">
        No service data yet
      </p>
    );
  }

  const maxCount = Math.max(...data.map((d) => Number(d.count)));

  return (
    <div ref={barsRef} className="space-y-4">
      {data.map((item) => {
        const pct = (Number(item.count) / maxCount) * 100;
        return (
          <div key={item.service} className="group">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="max-w-[140px] truncate text-xs text-ink-2 transition-colors group-hover:text-white sm:max-w-[200px] sm:text-sm">
                {item.service}
              </span>
              <span className="text-xs font-medium tabular-nums text-ink-3">
                {item.count}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                data-bar
                data-width={`${pct}%`}
                className="h-full rounded-full bg-signal transition-all duration-700 ease-out group-hover:bg-signal-ink"
                style={{ width: "0%" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
