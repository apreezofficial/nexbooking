import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "linear-gradient(135deg, #d4af37, #e6be8a)", color: "#1c1a14", fontSize: 120, fontWeight: 700 }}>
        E
      </div>
    ),
    { ...size },
  );
}
