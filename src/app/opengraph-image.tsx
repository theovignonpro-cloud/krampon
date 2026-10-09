import { ImageResponse } from "next/og";

export const alt = "Krampon — Ta story de match";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a1628 0%, #0f2035 50%, #081220 100%)",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            letterSpacing: "0.2em",
            color: "#C8AA5A",
            marginBottom: 24,
          }}
        >
          KRAMPON
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#FFFFFF",
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          Ta story de match ⚽
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#8899AA",
            fontWeight: 500,
          }}
        >
          Note les stats. Génère le visuel. Partage.
        </div>
      </div>
    ),
    { ...size }
  );
}
