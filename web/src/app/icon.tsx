import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", borderRadius: 18, background: "linear-gradient(135deg, #648dff, #a087ff)", color: "#ffffff", fontSize: 42, fontWeight: 700 }}>
        N
      </div>
    ),
    { ...size },
  );
}
