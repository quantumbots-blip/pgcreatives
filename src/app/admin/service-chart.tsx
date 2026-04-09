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
      <p className="py-10 text-center text-sm text-white/30">
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
              <span className="max-w-[140px] sm:max-w-[200px] truncate text-xs sm:text-sm text-white/60 group-hover:text-white/80 transition-colors">
                {item.service}
              </span>
              <span className="text-xs font-medium tabular-nums text-white/40">
                {item.count}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-purple/10">
              <div
                data-bar
                data-width={`${pct}%`}
                className="h-full rounded-full bg-gradient-to-r from-purple-dim to-purple transition-all duration-700 ease-out group-hover:to-purple-light"
                style={{ width: "0%" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
