"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * iPhone 17 scroll section with custom real-estate social proof screens.
 * No 3D — clean upright phone, screens crossfade on scroll.
 */

// ─── Custom screen components ────────────────────────────────────────────────

/** Screen 1 — TikTok / Reel: aerial property going viral */
function ScreenReel() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none">
      {/* Simulated aerial drone footage gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(175deg, #0a2a4a 0%, #1a4a2e 35%, #0d3520 60%, #061a0f 100%)",
        }}
      />
      {/* Sky */}
      <div
        className="absolute inset-x-0 top-0 h-[38%]"
        style={{
          background:
            "linear-gradient(180deg, #6ab0e8 0%, #a8d4f0 40%, #d4ebfa 100%)",
          opacity: 0.85,
        }}
      />
      {/* Landscape layer */}
      <div
        className="absolute inset-x-0"
        style={{
          top: "30%",
          height: "45%",
          background:
            "linear-gradient(180deg, #2d6a30 0%, #1e4d22 40%, #0f2e14 100%)",
          borderRadius: "60% 60% 0 0 / 20% 20% 0 0",
        }}
      />
      {/* Water glint */}
      <div
        className="absolute"
        style={{
          bottom: "10%",
          left: "10%",
          right: "10%",
          height: "28%",
          background:
            "linear-gradient(180deg, #3a8fc4 0%, #1a5c8a 60%, #0a3550 100%)",
          borderRadius: "40%",
          opacity: 0.8,
        }}
      />
      {/* Dark vignette at bottom for text */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "55%",
          background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)",
        }}
      />
      {/* Dark vignette at top */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: "25%",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)",
        }}
      />

      {/* Top bar */}
      <div className="absolute inset-x-0 top-[13%] flex items-center justify-between px-3">
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Following</span>
        <span style={{ fontSize: 12, color: "#fff", fontWeight: 700, letterSpacing: 0.5 }}>For You</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2"/>
          <path d="M16 16l4 4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Right-side action buttons */}
      <div className="absolute right-2.5 flex flex-col items-center gap-4"
        style={{ bottom: "22%", width: 40 }}>
        {/* Like */}
        <div className="flex flex-col items-center gap-0.5">
          <div style={{
            width: 40, height: 40,
            background: "rgba(255,255,255,0.12)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff3b5c">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>6,700</span>
        </div>
        {/* Comment */}
        <div className="flex flex-col items-center gap-0.5">
          <div style={{
            width: 40, height: 40,
            background: "rgba(255,255,255,0.12)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>284</span>
        </div>
        {/* Share */}
        <div className="flex flex-col items-center gap-0.5">
          <div style={{
            width: 40, height: 40,
            background: "rgba(255,255,255,0.12)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M22 2L15 22 11 13 2 9l20-7z" stroke="white" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>1.2K</span>
        </div>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 px-3 pb-5">
        {/* Username & follow */}
        <div className="flex items-center gap-2 mb-1.5">
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            border: "1.5px solid white",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 10, color: "white", fontWeight: 700 }}>PG</span>
          </div>
          <span style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>@pgcreativesmedia</span>
          <div style={{
            border: "1px solid rgba(255,255,255,0.7)",
            borderRadius: 4,
            padding: "1px 7px",
          }}>
            <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>Follow</span>
          </div>
        </div>
        {/* Caption */}
        <p style={{ fontSize: 11.5, color: "#fff", lineHeight: 1.4, marginBottom: 6 }}>
          Lakefront estate hits the market 🏡✨ Watch this property sell itself
          <span style={{ color: "#a78bfa" }}> #RealEstate #LuxuryHomes #GreenBay</span>
        </p>
        {/* Views bar */}
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white" opacity="0.8">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3" fill="black"/>
          </svg>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>181,705 views</span>
          <span style={{
            fontSize: 9, color: "#fff", fontWeight: 700,
            background: "linear-gradient(90deg, #ff3b5c, #ff6b35)",
            borderRadius: 4,
            padding: "1px 5px",
            marginLeft: 4,
          }}>🔥 TRENDING</span>
        </div>
      </div>
    </div>
  );
}

/** Screen 2 — Instagram Reels Insights */
function ScreenInsights() {
  return (
    <div className="relative w-full h-full overflow-hidden select-none"
      style={{ background: "#f2f2f7", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* iOS-style top nav */}
      <div style={{ background: "#fff", borderBottom: "0.5px solid rgba(0,0,0,0.15)", padding: "10px 14px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="#007aff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#000" }}>Reel Insights</span>
          <div style={{ width: 24 }} />
        </div>
      </div>

      {/* Reel thumbnail preview */}
      <div style={{ margin: "10px 12px", borderRadius: 12, overflow: "hidden", position: "relative", height: 90 }}>
        <div style={{
          background: "linear-gradient(135deg, #0a2a4a, #1a4a2e)",
          height: "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "12px solid white", marginLeft: 2 }} />
          </div>
        </div>
        <div style={{
          position: "absolute", bottom: 6, left: 8, right: 8,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>Lakefront Estate — Green Bay</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>0:45</span>
        </div>
      </div>

      {/* Overview card */}
      <div style={{ margin: "0 12px 8px", background: "#fff", borderRadius: 12, padding: "12px 14px" }}>
        <span style={{ fontSize: 11, color: "#666", fontWeight: 500 }}>ACCOUNTS REACHED</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "4px 0 2px" }}>
          <span style={{ fontSize: 30, fontWeight: 800, color: "#000", letterSpacing: -1 }}>2.1M</span>
          <span style={{ fontSize: 12, color: "#30d158", fontWeight: 700 }}>↑ 847%</span>
        </div>
        <span style={{ fontSize: 11, color: "#888" }}>vs. your previous Reels</span>
      </div>

      {/* Stats grid */}
      <div style={{ margin: "0 12px 8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          { label: "Likes", value: "6,700", color: "#ff3b5c", icon: "♥" },
          { label: "Comments", value: "284", color: "#007aff", icon: "💬" },
          { label: "Shares", value: "1,240", color: "#5856d6", icon: "↗" },
          { label: "Saves", value: "3,180", color: "#ff9500", icon: "🔖" },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{ background: "#fff", borderRadius: 12, padding: "10px 12px" }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <div style={{ fontSize: 18, fontWeight: 800, color, marginTop: 2 }}>{value}</div>
            <div style={{ fontSize: 10, color: "#888", fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Badge */}
      <div style={{
        margin: "0 12px",
        background: "linear-gradient(135deg, #7c3aed22, #4f46e522)",
        border: "1px solid #7c3aed44",
        borderRadius: 12,
        padding: "10px 14px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 22 }}>🏆</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed" }}>Top 3% of all Reels</div>
          <div style={{ fontSize: 10, color: "#666" }}>in Real Estate this week</div>
        </div>
      </div>
    </div>
  );
}

/** Screen 3 — Property Showcase: luxury home Reel */
function ScreenShowcase() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none">
      {/* Luxury interior gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, #2a1a0e 0%, #4a2e14 25%, #3a2010 50%, #1a0e06 100%)",
        }}
      />
      {/* Warm light cone from upper right */}
      <div
        className="absolute"
        style={{
          top: "-10%",
          right: "-5%",
          width: "70%",
          height: "70%",
          background: "radial-gradient(ellipse, rgba(255,200,100,0.25) 0%, transparent 70%)",
        }}
      />
      {/* Floor reflection */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "35%",
          background: "linear-gradient(to top, rgba(60,30,10,0.6) 0%, transparent 100%)",
        }}
      />
      {/* Window light streaks */}
      {[15, 38, 61].map((left, i) => (
        <div key={i} className="absolute"
          style={{
            top: "10%", left: `${left}%`,
            width: "18%", height: "55%",
            background: "linear-gradient(180deg, rgba(255,220,150,0.12) 0%, transparent 100%)",
            transform: "skewX(-3deg)",
          }}
        />
      ))}
      {/* Gradient overlays for text */}
      <div className="absolute inset-x-0 top-0" style={{ height: "30%", background: "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)" }} />
      <div className="absolute inset-x-0 bottom-0" style={{ height: "50%", background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)" }} />

      {/* Top bar */}
      <div className="absolute inset-x-0 top-[13%] flex items-center justify-between px-3">
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>Following</span>
        <span style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>For You</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2"/>
          <path d="M16 16l4 4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* JUST SOLD badge */}
      <div className="absolute" style={{ top: "16%", left: 14 }}>
        <div style={{
          background: "linear-gradient(90deg, #ef4444, #dc2626)",
          borderRadius: 6,
          padding: "3px 9px",
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
          <span style={{ fontSize: 10, color: "#fff", fontWeight: 800, letterSpacing: 1 }}>JUST SOLD</span>
        </div>
      </div>

      {/* Right-side actions */}
      <div className="absolute right-2.5 flex flex-col items-center gap-4" style={{ bottom: "22%", width: 40 }}>
        {[
          { icon: "♥", count: "12.5K", color: "#ff3b5c" },
          { icon: "💬", count: "512" },
          { icon: "↗", count: "2.3K" },
        ].map(({ icon, count, color }) => (
          <div key={icon} className="flex flex-col items-center gap-0.5">
            <div style={{
              width: 40, height: 40,
              background: "rgba(255,255,255,0.12)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, color: color || "white",
            }}>
              {icon}
            </div>
            <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>{count}</span>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="absolute inset-x-0 bottom-0 px-3 pb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            border: "1.5px solid white",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 10, color: "white", fontWeight: 700 }}>PG</span>
          </div>
          <span style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>@pgcreativesmedia</span>
        </div>
        <p style={{ fontSize: 11.5, color: "#fff", lineHeight: 1.4, marginBottom: 6 }}>
          $2.4M luxury estate — sold in 4 days 🔑 The power of professional media
          <span style={{ color: "#a78bfa" }}> #LuxuryRealEstate #Wisconsin</span>
        </p>
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white" opacity="0.8">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3" fill="black"/>
          </svg>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>750,240 views</span>
          <span style={{
            fontSize: 9, color: "#fff", fontWeight: 700,
            background: "linear-gradient(90deg, #f59e0b, #ef4444)",
            borderRadius: 4, padding: "1px 5px", marginLeft: 4,
          }}>⚡ VIRAL</span>
        </div>
      </div>
    </div>
  );
}

// ─── iPhone 17 SVG Frame ─────────────────────────────────────────────────────

function IPhone17Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative w-[258px] sm:w-[272px] lg:w-[290px]"
      style={{ aspectRatio: "393 / 852" }}
    >
      {/* Screen content (behind frame) */}
      <div
        className="absolute overflow-hidden bg-black"
        style={{
          top: "1.4%",
          left: "1.25%",
          right: "1.25%",
          bottom: "1.4%",
          borderRadius: "13%",
        }}
      >
        {children}
      </div>

      {/* iOS status bar (time + icons) */}
      <div
        className="absolute flex items-center justify-between pointer-events-none"
        style={{
          top: "3.2%",
          left: "6%",
          right: "6%",
          zIndex: 30,
        }}
      >
        <span style={{ fontSize: 10, color: "#fff", fontWeight: 700, letterSpacing: -0.3 }}>9:41</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {/* Signal */}
          <svg width="14" height="10" viewBox="0 0 17 12" fill="white">
            <rect x="0" y="7" width="3" height="5" rx="1"/>
            <rect x="4.5" y="5" width="3" height="7" rx="1"/>
            <rect x="9" y="2.5" width="3" height="9.5" rx="1"/>
            <rect x="13.5" y="0" width="3" height="12" rx="1"/>
          </svg>
          {/* WiFi */}
          <svg width="13" height="10" viewBox="0 0 16 12" fill="white">
            <path d="M8 9a1 1 0 100 2 1 1 0 000-2z"/>
            <path d="M4.5 6.5C5.5 5.5 6.7 5 8 5s2.5.5 3.5 1.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M1.5 3.5C3.5 1.5 5.7 0.5 8 0.5s4.5 1 6.5 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
          {/* Battery */}
          <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
            <div style={{ width: 20, height: 10, border: "1.2px solid rgba(255,255,255,0.8)", borderRadius: 2.5, padding: 1.5, display: "flex", alignItems: "center" }}>
              <div style={{ width: "82%", height: "100%", background: "#fff", borderRadius: 1.2 }} />
            </div>
            <div style={{ width: 2, height: 5, background: "rgba(255,255,255,0.6)", borderRadius: 1 }} />
          </div>
        </div>
      </div>

      {/* SVG Frame (on top of everything) */}
      <svg
        viewBox="0 0 393 852"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 20 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ti17" x1="0" y1="0" x2="393" y2="852" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#565664" />
            <stop offset="18%"  stopColor="#40404e" />
            <stop offset="48%"  stopColor="#2e2e3a" />
            <stop offset="78%"  stopColor="#3e3e4c" />
            <stop offset="100%" stopColor="#24242e" />
          </linearGradient>
          <linearGradient id="bez17" x1="0" y1="0" x2="393" y2="852" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#10101a" />
            <stop offset="100%" stopColor="#07070e" />
          </linearGradient>
        </defs>

        {/* Titanium frame ring (evenodd = transparent screen hole) */}
        <path
          fillRule="evenodd"
          fill="url(#ti17)"
          d={[
            "M57,1 L336,1 A56,56,0,0,1,392,57 L392,795 A56,56,0,0,1,336,851 L57,851 A56,56,0,0,1,1,795 L1,57 A56,56,0,0,1,57,1 Z",
            "M53,12 L340,12 A47,47,0,0,1,387,59 L387,793 A47,47,0,0,1,340,840 L53,840 A47,47,0,0,1,6,793 L6,59 A47,47,0,0,1,53,12 Z",
          ].join(" ")}
        />

        {/* Inner bezel ring */}
        <path
          fillRule="evenodd"
          fill="url(#bez17)"
          opacity="0.9"
          d={[
            "M53,12 L340,12 A47,47,0,0,1,387,59 L387,793 A47,47,0,0,1,340,840 L53,840 A47,47,0,0,1,6,793 L6,59 A47,47,0,0,1,53,12 Z",
            "M54,14 L339,14 A45,45,0,0,1,384,59 L384,793 A45,45,0,0,1,339,838 L54,838 A45,45,0,0,1,9,793 L9,59 A45,45,0,0,1,54,14 Z",
          ].join(" ")}
        />

        {/* Dynamic Island */}
        <rect x="143" y="19" width="107" height="36" rx="18" fill="#080810" />
        {/* Camera dot */}
        <circle cx="227" cy="37" r="8" fill="#0e0e1c" />
        <circle cx="227" cy="37" r="5.5" fill="#08080f" />
        <circle cx="224.5" cy="34.5" r="1.6" fill="rgba(255,255,255,0.22)" />
        <circle cx="229.5" cy="39" r="0.8" fill="rgba(139,92,246,0.35)" />

        {/* Side buttons */}
        <rect x="-1" y="148" width="4" height="32" rx="2" fill="#44444e" />
        <rect x="-1" y="198" width="4" height="56" rx="2" fill="#44444e" />
        <rect x="-1" y="265" width="4" height="56" rx="2" fill="#44444e" />
        <rect x="390" y="210" width="4" height="72" rx="2" fill="#44444e" />

        {/* Edge highlights */}
        <line x1="66" y1="1.5" x2="327" y2="1.5" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        <line x1="1.5" y1="82" x2="1.5" y2="770" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

        {/* Outer glow stroke */}
        <rect x="1" y="1" width="391" height="850" rx="56" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      </svg>

      {/* Drop shadow */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-28px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "70%",
          height: "28px",
          background: "radial-gradient(ellipse, rgba(139,92,246,0.35) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)",
          filter: "blur(14px)",
        }}
      />
      <div
        className="absolute inset-0 rounded-[12%] pointer-events-none"
        style={{
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.05), 0 28px 80px -10px rgba(0,0,0,0.95), 0 8px 30px -6px rgba(139,92,246,0.22)",
        }}
      />
    </div>
  );
}

// ─── Main section component ───────────────────────────────────────────────────

const SCREENS = [ScreenReel, ScreenInsights, ScreenShowcase];

export function IPhoneScroll({
  images: _images,
  className,
}: {
  images?: string[];
  className?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeScreen, setActiveScreen] = useState(0);

  const handleScroll = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    const progress = Math.max(0, Math.min(1, -rect.top / total));
    setScrollProgress(progress);
    setActiveScreen(
      Math.min(SCREENS.length - 1, Math.floor(progress * SCREENS.length))
    );
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const textVisible = scrollProgress > 0.06;

  return (
    <section
      ref={sectionRef}
      className={cn("relative min-h-[280vh] bg-background", className)}
    >
      <div className="sticky top-0 flex min-h-screen items-center justify-center overflow-hidden py-16">
        {/* Background glow */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{
            background:
              "radial-gradient(ellipse 55% 60% at 65% 50%, rgba(139,92,246,0.1) 0%, transparent 65%)",
            opacity: scrollProgress > 0.08 && scrollProgress < 0.92 ? 1 : 0,
          }}
        />

        <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 lg:flex-row lg:gap-20">
          {/* ── Text side ── */}
          <div
            className="max-w-md text-center lg:text-left order-2 lg:order-1"
            style={{
              opacity: textVisible ? Math.min(1, (scrollProgress - 0.06) / 0.12) : 0,
              transform: `translateY(${Math.max(0, 32 - scrollProgress * 130)}px)`,
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}
          >
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-purple-light/60 mb-4">
              Social Media Ready
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Content That
              <br />
              <span className="gradient-text">Stops the Scroll</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/40 leading-relaxed">
              Every photo and video we create is optimized for social media.
              Vertical formats, cinematic quality, and proven results — your
              listings go viral.
            </p>

            {/* Screen indicator dots */}
            <div className="mt-8 flex items-center gap-2 justify-center lg:justify-start">
              {SCREENS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === activeScreen
                      ? "w-8 bg-purple-light"
                      : "w-1.5 bg-white/15"
                  )}
                />
              ))}
            </div>

            {/* Screen labels */}
            <div className="mt-5 space-y-1">
              {[
                { label: "181K views in 48 hours", screen: 0 },
                { label: "2.1M accounts reached", screen: 1 },
                { label: "$2.4M sold in 4 days", screen: 2 },
              ].map(({ label, screen }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 transition-all duration-300"
                  style={{
                    opacity: activeScreen === screen ? 1 : 0.3,
                    transform: activeScreen === screen ? "translateX(0)" : "translateX(-4px)",
                  }}
                >
                  <div
                    className="flex-shrink-0 w-1.5 h-1.5 rounded-full transition-colors duration-300"
                    style={{ background: activeScreen === screen ? "#a78bfa" : "#ffffff26" }}
                  />
                  <span
                    className="text-sm transition-colors duration-300"
                    style={{ color: activeScreen === screen ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── iPhone 17 ── */}
          <div className="relative order-1 lg:order-2 shrink-0">
            <IPhone17Frame>
              {SCREENS.map((Screen, i) => (
                <div
                  key={i}
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{ opacity: i === activeScreen ? 1 : 0 }}
                >
                  <Screen />
                </div>
              ))}
            </IPhone17Frame>
          </div>
        </div>
      </div>
    </section>
  );
}
