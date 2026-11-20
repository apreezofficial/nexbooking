import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteName, siteTagline } from "@/lib/site";

export const socialImageSize = { width: 1200, height: 630 };
export const socialImageAlt = `${siteName}: ${siteTagline.toLowerCase()}`;

// Read once when the module loads (at build time) so the image can be prerendered.
const scene = await readFile(join(process.cwd(), "public/assets/hero-scene.png"));
const sceneSrc = `data:image/png;base64,${scene.toString("base64")}`;

/** The 1200x630 card shown when a NexBooking link is shared. Generated once at build time. */
export function renderSocialImage() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", background: "#080d32" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sceneSrc} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, background: "linear-gradient(90deg, rgba(8,13,50,0.95) 0%, rgba(8,13,50,0.82) 48%, rgba(8,13,50,0.05) 100%)" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", width: 820, height: 630, padding: "64px 72px" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 40, fontWeight: 700, color: "#ffffff", letterSpacing: -1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, marginRight: 16, borderRadius: 16, background: "linear-gradient(135deg, #648dff, #a087ff)", fontSize: 32 }}>N</div>
            {siteName}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.08, color: "#ffffff", letterSpacing: -2 }}>{siteTagline}</div>
            <div style={{ display: "flex", marginTop: 24, fontSize: 28, lineHeight: 1.4, color: "#d6d9ff" }}>
              Bookings, payments, consultations, notes and invoices, together.
            </div>
          </div>
        </div>
      </div>
    ),
    { ...socialImageSize },
  );
}
