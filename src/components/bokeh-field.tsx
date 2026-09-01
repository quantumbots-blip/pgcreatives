"use client";

import { useEffect, useRef } from "react";

/**
 * Drifting lens bokeh — the site's ambient background layer.
 *
 * Out-of-focus highlights are what a fast lens actually produces, so this is
 * the one piece of atmosphere that belongs to a photography company rather
 * than being generic decoration. Each disc sits at a depth: further discs are
 * larger, softer, dimmer, and drift more slowly, which is what gives the page
 * a sense of space behind the content.
 *
 * Cost control, because this is a full-viewport layer that never stops:
 * - Discs are radial gradients, not `filter: blur()`. Blur is the single most
 *   expensive thing this site could ask a phone to rasterise; a gradient is
 *   effectively free and looks the same at this softness.
 * - Capped at 30fps. At this drift speed nobody can tell, and it halves the
 *   work.
 * - The canvas backing store is capped at 1.5x regardless of DPR — at this
 *   blur level a 3x buffer is invisible and costs 4x the fill.
 * - Paused whenever the tab is hidden or the field scrolls out of view.
 * - Not rendered at all under `prefers-reduced-motion`, and the disc count
 *   drops on small screens.
 */

type Disc = {
  x: number;
  y: number;
  r: number;
  /** 0 = far, 1 = near. Drives size, alpha and parallax rate. */
  depth: number;
  vx: number;
  vy: number;
  hue: "signal" | "white";
};

const FRAME_MS = 1000 / 30;

export function BokehField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let discs: Disc[] = [];
    let frame = 0;
    let last = 0;
    let scrollY = window.scrollY;
    let visible = true;

    const count = () => (window.innerWidth < 768 ? 9 : 20);

    const build = () => {
      const n = count();
      discs = Array.from({ length: n }, () => {
        const depth = Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          // Far discs are big and soft; near ones are small and tighter.
          r: 26 + (1 - depth) * 150 + Math.random() * 40,
          depth,
          vx: (Math.random() - 0.5) * 0.10 * (0.3 + depth),
          vy: -(0.04 + Math.random() * 0.10) * (0.3 + depth),
          hue: Math.random() > 0.45 ? "signal" : "white",
        };
      });
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (!visible || document.hidden) return;
      if (now - last < FRAME_MS) return;
      last = now;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (const d of discs) {
        d.x += d.vx;
        d.y += d.vy;

        // Wrap with a margin so nothing pops in at an edge.
        const m = d.r * 2;
        if (d.y + m < 0) d.y = height + m;
        if (d.x + m < 0) d.x = width + m;
        if (d.x - m > width) d.x = -m;

        // Nearer discs travel further against the scroll — the parallax that
        // makes the layer read as depth rather than as a flat texture.
        const py = d.y - scrollY * (0.02 + d.depth * 0.10);
        const wrapped = ((py % (height + m * 2)) + height + m * 2) % (height + m * 2) - m;

        const alpha = 0.030 + d.depth * 0.055;
        const g = ctx.createRadialGradient(d.x, wrapped, 0, d.x, wrapped, d.r);
        if (d.hue === "signal") {
          g.addColorStop(0, `rgba(78, 168, 255, ${alpha})`);
          g.addColorStop(0.55, `rgba(78, 168, 255, ${alpha * 0.45})`);
        } else {
          g.addColorStop(0, `rgba(210, 230, 255, ${alpha * 0.75})`);
          g.addColorStop(0.55, `rgba(210, 230, 255, ${alpha * 0.3})`);
        }
        g.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(d.x, wrapped, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const onScroll = () => {
      scrollY = window.scrollY;
    };
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    // Honour a mid-session change to the motion preference.
    const onPref = () => {
      if (reduce.matches) {
        cancelAnimationFrame(frame);
        ctx.clearRect(0, 0, width, height);
      }
    };
    reduce.addEventListener("change", onPref);

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      reduce.removeEventListener("change", onPref);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
