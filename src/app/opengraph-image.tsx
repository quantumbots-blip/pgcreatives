import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PG Creatives - Professional Grade Media";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #040A2D 0%, #0A1240 50%, #0E1850 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative gradient orb */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(109,40,217,0.2) 0%, transparent 70%)",
          }}
        />

        {/* PG text */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>PG</span>
          <span style={{ color: "#C4B5FD" }}>Creatives</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.5)",
            marginTop: 16,
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
          }}
        >
          Professional Grade Media
        </div>

        {/* Service pills */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 40,
          }}
        >
          {["Photography", "Videography", "Drone", "3D Tours", "Branding"].map(
            (service) => (
              <div
                key={service}
                style={{
                  padding: "8px 20px",
                  borderRadius: 100,
                  border: "1px solid rgba(139,92,246,0.3)",
                  color: "#C4B5FD",
                  fontSize: 16,
                  background: "rgba(139,92,246,0.1)",
                }}
              >
                {service}
              </div>
            )
          )}
        </div>

        {/* Location */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 16,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.15em",
            textTransform: "uppercase" as const,
          }}
        >
          Green Bay · Madison · Fox Valley, Wisconsin
        </div>
      </div>
    ),
    { ...size }
  );
}
