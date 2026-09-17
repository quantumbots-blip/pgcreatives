/**
 * An email at a glance: the real HTML, drawn at a third of its size.
 *
 * A plain iframe with no scripts and an opaque origin; the page cannot see
 * the dashboard and the dashboard's styles cannot reach the email. Scaled
 * with a transform rather than resized, so the layout is the 600px one a
 * desktop client shows. Works in server and client components alike.
 */
export function Thumb({ html, height = 260, ground = "#07090c" }: { html: string; height?: number; ground?: string }) {
  const scale = 1 / 3;
  return (
    <div className="relative w-full overflow-hidden" style={{ height, background: ground }} aria-hidden="true">
      <iframe
        srcDoc={html}
        sandbox=""
        tabIndex={-1}
        title=""
        scrolling="no"
        style={{
          width: 600,
          height: height / scale,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          left: "50%",
          marginLeft: -100,
          top: 0,
          border: 0,
          pointerEvents: "none",
          background: ground,
        }}
      />
    </div>
  );
}
