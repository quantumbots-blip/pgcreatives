// Tiny coordination channel between the hero video and the splash screen.
// The splash keeps covering the page until the (heavy) hero video is actually
// playing, so visitors — especially on mobile — see a clean logo → video
// hand-off instead of a poster flash while the video buffers.

export const HERO_VIDEO_READY_EVENT = "hero-video-ready";

// Module-scoped flag so the splash can detect readiness even if the video
// signalled before the splash attached its listener. Resets on full reload.
let ready = false;

export function markHeroVideoReady() {
  if (ready) return;
  ready = true;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(HERO_VIDEO_READY_EVENT));
  }
}

export function isHeroVideoReady() {
  return ready;
}

export function onHeroVideoReady(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(HERO_VIDEO_READY_EVENT, callback);
  return () => window.removeEventListener(HERO_VIDEO_READY_EVENT, callback);
}
