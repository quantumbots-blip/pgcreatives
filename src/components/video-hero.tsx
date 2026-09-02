"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";

// Two renditions of the same 75-second loop. The desktop file is 16:9 at 720p;
// the phone file is the 9:16 centre crop that `object-cover` actually displays
// on a portrait screen, so none of its bytes are spent on pixels that get
// cropped away.
//
// This is the FULL take, restored from the 1920x1080 master in git history
// (26e9519). It had been cut to 24.5s to save weight, which made the loop
// obvious. Re-encoded two-pass at 24fps instead — 380k desktop, 190k mobile —
// which buys back all three minutes of footage for +28% and +64% bytes
// respectively. The file is behind a heavy scrim and only ever downloads on a
// fast connection, so the lower bitrate costs nothing anyone can see.
const VIDEO_SRC_DESKTOP = "/hero-video-v6.mp4";
const VIDEO_SRC_MOBILE = "/hero-video-mobile-v2.mp4";

// Matches the site's mobile breakpoint. A phone in landscape is wider than this
// and correctly gets the 16:9 file, which is the one that fits that shape.
const MOBILE_QUERY = "(max-width: 768px)";

function heroVideoSrc() {
  return window.matchMedia(MOBILE_QUERY).matches
    ? VIDEO_SRC_MOBILE
    : VIDEO_SRC_DESKTOP;
}

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string; downlink?: number };
};

// How many times we may call play() on our own before waiting for a real user
// gesture. Without a cap, a refused play() and the `pause` event it triggers
// feed each other and peg the main thread — which reads as a frozen page.
const MAX_AUTO_ATTEMPTS = 3;
// Delay before retrying after an unexpected pause. Long enough that a retry
// storm can never occupy consecutive frames.
const RETRY_DELAY_MS = 400;

/* The two hero planes. The backdrop sits behind the picture plane and is
   scaled to cover the extra apparent distance ((1200+140)/1200 = 1.117), so
   pushing it back reads as depth rather than as the video shrinking. */
const BASE_BG = "translateZ(-140px) scale(1.125)";
const BASE_CONTENT = "translateZ(60px)";

export function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);

  // Parallax: the backdrop drifts at a quarter of scroll speed and the copy
  // lifts and fades as the visitor leaves the hero. Pointer devices only —
  // the same transform on a phone's full-screen video layer is a compositor
  // cost with no payoff, since the hero is gone in one flick. One passive
  // scroll listener, one rAF, two transforms; nothing here touches layout.
  useEffect(() => {
    const bg = bgRef.current;
    const content = contentRef.current;
    if (!bg || !content) return;
    bg.style.transform = BASE_BG;
    content.style.transform = BASE_CONTENT;
    const mq = window.matchMedia(
      "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    );
    if (!mq.matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const vh = window.innerHeight || 1;
      if (y > vh) return; // hero is off-screen; leave it where it was
      const t = Math.min(1, y / vh);
      // BASE_* keep the two planes separated in Z; the scroll offset composes
      // with them rather than replacing them.
      bg.style.transform = `${BASE_BG} translate3d(0, ${Math.round(y * 0.25)}px, 0)`;
      content.style.transform = `${BASE_CONTENT} translate3d(0, ${Math.round(y * 0.12)}px, 0)`;
      content.style.opacity = String(1 - t * 1.1);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* Pointer parallax. The backdrop leans away from the cursor and the copy
       leans toward it, which is what separates them into two planes rather
       than one flat picture. Written inside a rAF and only for a mouse — a
       finger has no hover position to read. */
    let pFrame = 0;
    let px = 0;
    let py = 0;
    const applyPointer = () => {
      pFrame = 0;
      bg.style.setProperty("--px", `${px * -14}px`);
      bg.style.setProperty("--py", `${py * -10}px`);
      content.style.setProperty("--px", `${px * 12}px`);
      content.style.setProperty("--py", `${py * 8}px`);
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX / (window.innerWidth || 1) - 0.5;
      py = e.clientY / (window.innerHeight || 1) - 0.5;
      if (!pFrame) pFrame = requestAnimationFrame(applyPointer);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (pFrame) cancelAnimationFrame(pFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      bg.style.transform = BASE_BG;
      content.style.transform = BASE_CONTENT;
      content.style.opacity = "";
    };
  }, []);

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
    /* The gate used to catch only 2g and Data Saver, so a real 3G or slow-4G
       phone downloaded the whole 1.09 MB file — measured at ~5.4s on a
       1.6 Mbps pipe, which makes the video supersede the poster as the LCP
       element and takes mobile LCP from 1.34s to 4.94s, past Google's 4s
       "poor" threshold. Slow connections now keep the poster, which is the
       LCP element the hero was designed around anyway. */
    const effectiveType = conn?.effectiveType ?? "";
    const frugal =
      conn?.saveData === true ||
      /(^|-)[23]g$/.test(effectiveType) ||
      (typeof conn?.downlink === "number" && conn.downlink < 2);

    if (reduceMotion || frugal) return;

    // Wait for an idle moment. Hydration is the busiest point in the page's
    // life and this video is decorative — it must never compete with it.
    let canceled = false;
    const start = () => {
      if (!canceled) setVideoEnabled(true);
    };

    // requestIdleCallback is unsupported on Safari before 17, which is exactly
    // the population this change is aimed at — fall back to a plain timer.
    const useIdle = typeof window.requestIdleCallback === "function";
    const handle: number = useIdle
      ? window.requestIdleCallback(start, { timeout: 2500 })
      : window.setTimeout(start, 1200);

    return () => {
      canceled = true;
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
    <section className="scene viewfinder viewfinder-front viewfinder-hero relative -mt-16 flex min-h-[96svh] items-center overflow-clip sm:min-h-[92svh] lg:-mt-20 lg:min-h-screen">
      {/* The bottom half of the viewfinder ticks. The top two are drawn by
          `.viewfinder` itself; this empty element carries the other two. */}
      <span className="vf-b" aria-hidden="true" />

      {/* Backdrop layer — moved as one unit by the parallax effect. */}
      <div ref={bgRef} className="hero-parallax-bg absolute inset-0">
        {/* Poster — shows while video loads or if video fails. Loaded eagerly
            rather than preloaded: the splash logo owns the preload slot, and
            competing <link rel="preload"> tags just delay each other. */}
        <Image
          src="/images/hero-poster.jpg"
          alt=""
          fill
          className="object-cover"
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
        />

        {/* Video — hidden until ready to prevent flash. The src is attached from
            an effect rather than rendered up front, so reduced-motion and
            Data Saver visitors never pay for the download at all. */}
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Scrim. Weighted to the bottom-left, where the copy sits, and heavy
            enough that the headline never has to compete with a lamp. The old
            pair of even gradients left the type sitting on a lit fireplace. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,9,12,0.97)_0%,rgba(7,9,12,0.88)_30%,rgba(7,9,12,0.62)_65%,rgba(7,9,12,0.72)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(7,9,12,0.35)_0%,rgba(7,9,12,0.72)_65%,rgba(7,9,12,0.9)_100%)]" />
      </div>

      {/* Content.

          Centred: the kicker, headline, lede and both actions sit on one
          axis down the middle of the frame. A left-aligned hero puts the
          copy against the edge of a photograph that is doing nothing on the
          other side; centring makes the image the stage and the words the
          subject standing on it. */}
      <div
        ref={contentRef}
        className="hero-parallax-content relative z-10 w-full pb-14 pt-24 sm:pb-28 sm:pt-32 lg:pb-32"
      >
        <div className="shell">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <p className="animate-hero-fade-up meta hero-markets flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-white/70">
              {[
                { name: "Green Bay", first: true },
                { name: "Madison" },
                { name: "Milwaukee" },
                { name: "Fox Valley", last: true },
              ].map((m) => (
                <span key={m.name} className="inline-flex items-center gap-x-2 whitespace-nowrap">
                  <span className={m.first ? "text-signal-ink" : undefined}>{m.name}</span>
                  {!m.last && <span aria-hidden="true">/</span>}
                </span>
              ))}
            </p>

            {/* The trailing space matters. Below 640px these masks collapse to
                inline flow so the browser can break the headline itself, and
                without it the two lines run together as "Professionalgrade".
                `DisplayLines` does the same thing for every other heading. */}
            <h1 className="display-1 mt-[clamp(2rem,6svh,3.75rem)] text-white">
              <span className="line-mask">
                <span className="line-inner hero-line" style={{ animationDelay: "0.18s" }}>
                  Professional{" "}
                </span>
              </span>
              <span className="line-mask">
                <span className="line-inner hero-line" style={{ animationDelay: "0.30s" }}>
                  grade media.
                </span>
              </span>
            </h1>

            <p
              className="animate-hero-fade-up lede mt-[clamp(1.75rem,5svh,2.75rem)] max-w-xl"
              style={{ animationDelay: "0.44s" }}
            >
              Listing photography, video, drone and 3D tours for Wisconsin
              agents, plus the personal-brand content that keeps you in front
              of your market between listings.
            </p>

            <div
              className="animate-hero-fade-up mx-auto mt-[clamp(2.5rem,7svh,4.25rem)] flex w-full max-w-[17.5rem] flex-col items-stretch gap-3 sm:max-w-none sm:w-auto sm:flex-row sm:items-center sm:gap-4"
              style={{ animationDelay: "0.56s" }}
            >
              <Link href="/#book" className="btn btn-primary">
                Book a shoot
                <ArrowRight className="arrow h-4 w-4" />
              </Link>
              <Link href="/portfolio" className="btn btn-ghost">
                <Play className="h-3.5 w-3.5" />
                See the work
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue — aligned to the content column rather than floated in the
          middle of the viewport, and hidden on phones where a short screen
          (iPhone SE) puts it on top of the buttons. */}
      <div
        className="animate-hero-fade-up absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 sm:block"
        style={{ animationDelay: "0.8s" }}
      >
        <div className="flex flex-col items-center gap-2.5">
          <span className="meta">Scroll</span>
          <div className="animate-hero-line h-10 w-px overflow-hidden">
            <div className="animate-scroll-cue h-full w-px bg-gradient-to-b from-signal-ink/70 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
