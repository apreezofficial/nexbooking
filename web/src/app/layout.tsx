import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Kalam, Plus_Jakarta_Sans } from "next/font/google";
import { Suspense } from "react";
import CookieConsent from "@/components/CookieConsent";
import DomTranslationGuard from "@/components/DomTranslationGuard";
import NavigationScrollHandler from "@/components/NavigationScrollHandler";
import RevealObserver from "@/components/RevealObserver";
import { siteDescription, siteName, siteTagline, siteUrl } from "@/lib/site";
import "./globals.css";
import "./brand-theme.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const logoFont = Kalam({ variable: "--font-logo", subsets: ["latin"], weight: "700" });

const serif = DM_Serif_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  icons: { icon: [{ url: "/icon", type: "image/png", sizes: "64x64" }], shortcut: "/icon", apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }] },
  title: { default: `${siteName} | ${siteTagline}`, template: `%s | ${siteName}` },
  description: siteDescription,
  keywords: ["online booking", "appointment booking", "business payments", "invoices and receipts", "consultations", "business notes"],
  authors: [{ name: siteName }],
  creator: siteName,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName, locale: "en", url: "/", title: `${siteName} | ${siteTagline}`, description: siteDescription },
  twitter: { card: "summary_large_image", title: `${siteName} | ${siteTagline}`, description: siteDescription },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1c1a14",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${serif.variable} ${logoFont.variable}`}
    >
      <body suppressHydrationWarning>
        <DomTranslationGuard />
        <RevealObserver />
        <Suspense fallback={null}>
          <NavigationScrollHandler />
        </Suspense>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
