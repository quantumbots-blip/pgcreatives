"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { MagneticButton } from "@/components/magnetic-button";
import { FloatingParticles } from "@/components/floating-particles";

// Two renditions of the same footage. The desktop file is 16:9 at 720p; the
// phone file is the 9:16 centre crop that `object-cover` actually displays on a
// portrait screen, so none of its bytes are spent on pixels that get cropped
// away. That crop alone is most of the saving: 8.61 MB -> 3.33 MB at SSIM 0.973
// against a lossless reference, behind a hero overlay that is 47-81% black.
const VIDEO_SRC_DESKTOP = "/hero-video-v5.mp4";
const VIDEO_SRC_MOBILE = "/hero-video-mobile.mp4";

// Matches the site's mobile breakpoint. A phone in landscape is wider than this
// and correctly gets the 16:9 file, which is the one that fits that shape.
const MOBILE_QUERY = "(max-width: 768px)";

function heroVideoSrc() {
  return window.matchMedia(MOBILE_QUERY).matches
    ? VIDEO_SRC_MOBILE
    : VIDEO_SRC_DESKTOP;
}

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
};

// How many times we may call play() on our own before waiting for a real user
// gesture. Without a cap, a refused play() and the `pause` event it triggers
// feed each other and peg the main thread — which reads as a frozen page.
const MAX_AUTO_ATTEMPTS = 3;
// Delay before retrying after an unexpected pause. Long enough that a retry
// storm can never occupy consecutive frames.
const RETRY_DELAY_MS = 400;

export function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);

  // Decide whether to fetch the hero video at all, and never during hydration.
  // The file is multiple megabytes; downloading and decoding it is the single
  // largest memory cost on this page, and on iOS an over-budget tab stops
  // responding entirely rather than degrading. Reduced-motion, Data Saver and
  // 2G visitors keep the poster and never pay for it.
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const conn = (navigator as NavigatorWithConnection).connection;
    const frugal =
      conn?.saveData === true || /(^|-)2g$/.test(conn?.effectiveType ?? "");

    if (reduceMotion || frugal) return;

    // Wait for an idle moment. Hydration is the busiest point in the page's
    // life and this video is decorative — it must never compete with it.
    let cancelled = false;
    const start = () => {
      if (!cancelled) setVideoEnabled(true);
    };

    // requestIdleCallback is unsupported on Safari before 17, which is exactly
    // the population this change is aimed at — fall back to a plain timer.
    const useIdle = typeof window.requestIdleCallback === "function";
    const handle: number = useIdle
      ? window.requestIdleCallback(start, { timeout: 2500 })
      : window.setTimeout(start, 1200);

    return () => {
      cancelled = true;
      if (useIdle) window.cancelIdleCallback(handle);
      else clearTimeout(handle);
    };
  }, []);

  useEffect(() => {
    if (!videoEnabled) return;
    const video = videoRef.current;
    if (!video) return;

    let inView = true;
    let readyMarked = false;
    let attempts = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const markReady = () => {
      if (readyMarked) return;
      readyMarked = true;
      setVideoReady(true);
    };

    // Detaching the source is what actually stops the transfer. Without it the
    // browser keeps pulling the whole file down for a video it has already
    // refused to play — measured at the full 8.6 MB on a phone in Low Power
    // Mode. That download is wasted bandwidth and, worse, wasted memory on the
    // devices least able to spare it.
    const releaseSource = () => {
      if (!video.getAttribute("src")) return;
      video.removeAttribute("src");
      video.load(); // aborts the in-flight fetch and frees the buffer
    };

    // Re-attach before an attempt that has a real chance of succeeding, i.e.
    // one prompted by a user gesture.
    const attachSource = () => {
      if (video.getAttribute("src")) return;
      video.setAttribute("src", heroVideoSrc());
    };

    // The source failed for good — unsupported codec, 404, corrupt file. Give
    // the memory back and leave the poster showing.
    const onError = () => releaseSource();
    video.addEventListener("error", onError);

    // Attempt playback, but only when it makes sense (on-screen, page in the
    // foreground, and actually paused). iOS pauses background videos when they
    // scroll off-screen, when the tab is backgrounded, in Low Power Mode, and
    // after brief stalls — and never resumes on its own.
    //
    // The attempt budget is what keeps this safe. When playback is refused
    // outright (Low Power Mode, "Never autoplay", memory pressure) the browser
    // fires `pause` for every rejected play(), so retrying from that event
    // without a cap loops forever. After the budget is spent we go quiet and
    // wait for a signal that actually changes the odds — a user gesture, or the
    // page becoming visible again.
    const play = () => {
      if (document.hidden || !inView || !video.paused) return;
      // Source already handed back — nothing to play until a gesture re-attaches
      // it. Without this, the pause-driven retries below would keep calling
      // play() on an empty element.
      if (!video.getAttribute("src")) return;
      // A decode/network error is terminal for this source; retrying only
      // burns frames.
      if (video.error) return;
      if (attempts >= MAX_AUTO_ATTEMPTS) return;

      attempts++;
      video.muted = true; // required for autoplay to be allowed
      const p = video.play();
      if (p) {
        p.then(() => {
          attempts = 0;
          markReady();
        }).catch(() => {
          if (!readyMarked) {
            // It has never played, and the very first attempt was refused:
            // this device will not autoplay unprompted, full stop. Drop the
            // source immediately rather than finishing a multi-megabyte
            // download for a video that is not going to be shown. Retrying
            // here only prolongs the transfer — a user gesture is the one
            // thing that changes the answer, and that re-attaches the source.
            releaseSource();
            return;
          }
          // It was playing and got interrupted; the budget governs retries.
          if (attempts >= MAX_AUTO_ATTEMPTS) releaseSource();
        });
      }
    };

    // Signals driven by the user or the browser — not by us — so it's safe to
    // refill the budget here without risking a self-sustaining loop. A real
    // gesture also unlocks playback on devices that refuse it unprompted, so
    // this is the moment it's worth re-fetching the file.
    const playFromSignal = () => {
      attempts = 0;
      attachSource();
      play();
    };

    // Attach imperatively rather than through JSX: this effect takes ownership
    // of the src so it can drop and restore it without fighting React's diff.
    // With preload="none" and no autoplay attribute, attaching the src costs
    // nothing on its own — this play() call is what actually starts the
    // transfer, and a device that refuses playback rejects it before any
    // meaningful number of bytes moves.
    attachSource();
    play();

    video.addEventListener("canplay", play);
    video.addEventListener("loadeddata", play);

    // Resume when the video scrolls back into view.
    const io = new IntersectionObserver(
      (entries) => {
        const nowInView = entries.some((e) => e.isIntersecting);
        const reentered = nowInView && !inView;
        inView = nowInView;
        if (reentered) playFromSignal();
        else if (nowInView) play();
      },
      { threshold: 0.05 }
    );
    io.observe(video);

    // Resume when the tab/app comes back to the foreground.
    const onVisible = () => {
      if (!document.hidden) playFromSignal();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", playFromSignal);
    window.addEventListener("pageshow", playFromSignal);

    // If iOS pauses it while it's still on-screen, bring it back — on a timer
    // rather than a frame callback, and still bounded by the attempt budget.
    const onPause = () => {
      if (document.hidden || !inView || video.ended) return;
      clearTimeout(retryTimer);
      retryTimer = setTimeout(play, RETRY_DELAY_MS);
    };
    video.addEventListener("pause", onPause);

    // Low Power Mode blocks programmatic play entirely; recover on a user
    // gesture. Kept live (not once) so repeated blocks also recover — each
    // gesture buys exactly one fresh round of attempts.
    document.addEventListener("click", playFromSignal, { passive: true });
    document.addEventListener("touchstart", playFromSignal, { passive: true });

    return () => {
      clearTimeout(retryTimer);
      video.removeEventListener("error", onError);
      video.removeEventListener("canplay", play);
      video.removeEventListener("loadeddata", play);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", playFromSignal);
      window.removeEventListener("pageshow", playFromSignal);
      video.removeEventListener("pause", onPause);
      document.removeEventListener("click", playFromSignal);
      document.removeEventListener("touchstart", playFromSignal);
      // Hand the buffer back on navigation instead of leaving it held.
      releaseSource();
    };
  }, [videoEnabled]);

  return (
    <section className="relative -mt-22 lg:-mt-26 flex min-h-screen items-center overflow-x-clip">
      {/* Poster — shows while video loads or if video fails. Loaded eagerly
          rather than preloaded: the splash logo owns the preload slot, and
          competing <link rel="preload"> tags just delay each other. */}
      <Image
        src="/images/hero-poster.jpg"
        alt="Property showcase"
        fill
        className="object-cover"
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
      />

      {/* Video — hidden until ready to prevent flash. The src is attached from
          an effect rather than rendered up front, so reduced-motion and
          Data Saver visitors never pay for the download at all.
          preload="metadata" avoids eagerly buffering the whole file. */}
      {/* No `autoPlay` attribute on purpose: it overrides preload="none" and
          makes the browser start pulling the file the moment a src appears,
          which defeats the whole point of asking permission first. Playback is
          driven explicitly from the effect instead. */}
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          videoReady ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Overlay gradients — purple-tinted */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000000]/68 via-[#000000]/47 to-[#000000]/81" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/72 via-transparent to-transparent" />
      {/* Bottom fade to blend into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-48 sm:h-72 bg-gradient-to-t from-[#000000]/85 via-[#000000]/60 to-transparent" />

      {/* Single subtle ambient glow */}
      <div className="absolute bottom-0 left-1/3 h-[200px] w-[500px] bg-purple/[0.06] blur-[120px]" />
      <div className="hidden sm:block">
        <FloatingParticles count={12} />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 pt-24 sm:pt-20">
        <div className="max-w-3xl">
          <div
            className="animate-hero-fade-up mb-4 sm:mb-6 inline-flex items-center justify-center rounded-full border border-purple/25 bg-purple/10 px-3 h-7 sm:px-4 sm:h-8 backdrop-blur-sm transition-shadow duration-500 hover:shadow-[0_0_20px_rgba(55,140,210,0.25)]"
          >
            <span className="text-[11px] sm:text-xs font-medium tracking-[0.15em] sm:tracking-[0.2em] uppercase text-purple-light leading-none">
              Madison, Green Bay, and the Fox Valley
            </span>
          </div>

          <h1
            className="animate-hero-fade-up text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl"
            style={{ animationDelay: "0.15s" }}
          >
            <span className="text-white">Professional</span>
            <br />
            <span className="text-white">Grade Media</span>
          </h1>

          <p
            className="animate-hero-fade-up mt-6 max-w-lg text-base sm:text-lg font-light leading-relaxed text-white/70"
            style={{ animationDelay: "0.3s" }}
          >
            We help you present your listings better and build a brand people
            recognize. From video and photography to social media content,
            everything is made with intention. We bring your vision to life.
          </p>

          <div
            className="animate-hero-fade-up mt-8 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-4"
            style={{ animationDelay: "0.45s" }}
          >
            <MagneticButton>
              <Link
                href="/#portals"
                className="rounded-full bg-gradient-to-r from-purple-dim to-purple px-7 sm:px-8 py-3.5 sm:py-4 text-sm font-semibold tracking-wide text-white ring-1 ring-purple/40 shadow-none sm:shadow-[0_0_15px_rgba(55,140,210,0.25),0_0_40px_rgba(55,140,210,0.1)] transition-all duration-300 hover:scale-[1.03] sm:hover:shadow-[0_0_20px_rgba(55,140,210,0.4),0_0_50px_rgba(55,140,210,0.15)]"
              >
                Book a Shoot
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href="/portfolio"
                className="flex items-center gap-2.5 rounded-full border border-white/20 px-7 sm:px-8 py-3.5 sm:py-4 text-sm font-medium tracking-wide text-white/80 transition-all duration-300 hover:border-white/40 hover:bg-white/5 hover:text-white"
              >
                <Play className="h-3.5 w-3.5" />
                View Our Work
              </Link>
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="animate-hero-fade-up absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        style={{ animationDelay: "0.8s" }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-purple-light/40">
            Scroll
          </span>
          <div className="animate-hero-line h-10 w-px bg-gradient-to-b from-purple/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}
