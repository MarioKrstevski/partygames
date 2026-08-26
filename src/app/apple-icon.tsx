import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * The iOS home-screen icon: the same artwork at the size Safari wants, since
 * iOS falls back to a screenshot of the page without one.
 */
export default function AppleIcon() {
  const confetti = [
    { left: 84, top: 92, w: 48, h: 20, rotate: -24, color: "#f9a8d4" },
    { left: 336, top: 74, w: 42, h: 18, rotate: 33, color: "#fcd34d" },
    { left: 392, top: 244, w: 44, h: 18, rotate: -14, color: "#67e8f9" },
    { left: 66, top: 296, w: 40, h: 18, rotate: 42, color: "#86efac" },
    { left: 344, top: 392, w: 46, h: 20, rotate: -8, color: "#fcd34d" },
    { left: 108, top: 404, w: 36, h: 16, rotate: 18, color: "#67e8f9" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(140deg, #7c3aed 0%, #a855f7 45%, #ec4899 100%)",
          position: "relative",
        }}
      >
        {confetti.map((piece, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: piece.left,
              top: piece.top,
              width: piece.w,
              height: piece.h,
              borderRadius: 6,
              background: piece.color,
              opacity: 0.92,
              transform: `rotate(${piece.rotate}deg)`,
            }}
          />
        ))}
        {/* A glass — bowl, stem and base — reads as "party" even at 48px. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 186,
              height: 138,
              background: "#ffffff",
              borderRadius: "10px 10px 93px 93px",
            }}
          />
          <div style={{ display: "flex", width: 22, height: 52, background: "#ffffff" }} />
          <div
            style={{
              display: "flex",
              width: 104,
              height: 20,
              borderRadius: 10,
              background: "#ffffff",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
