import type { Metadata } from "next";
import { DM_Serif_Display, Kalam, Plus_Jakarta_Sans } from "next/font/google";
import RevealObserver from "@/components/RevealObserver";
import "./globals.css";

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
  title: "NexBooking",
  description: "Discover businesses, book services and manage your business with NexBooking.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${logoFont.variable}`}>
      <body>
        <RevealObserver />
        {children}
      </body>
    </html>
  );
}
