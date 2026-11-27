import type { Metadata } from "next";

export const siteName = "EdeBooking";
export const siteTagline = "Your services a click away";
export const siteDescription =
  "EdeBooking brings appointments, consultations, payments and business tools together. Discover services and manage bookings, notes, invoices and receipts.";

/**
 * The public origin used for canonical links, Open Graph URLs, the sitemap and structured data.
 * Set NEXT_PUBLIC_SITE_URL (for example your registered production domain) in production. On Vercel the
 * production domain is picked up automatically; outside Vercel a production build uses https://edebooking.com, and local development uses localhost.
 */
function resolveSiteUrl(): string {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || (vercel ? `https://${vercel}` : process.env.NODE_ENV === "production" ? "https://edebooking.com" : "http://localhost:3000");
  return origin.replace(/\/+$/, "");
}

export const siteUrl = resolveSiteUrl();

/**
 * Store listings for the mobile app. Set these in the environment once the app is published:
 * NEXT_PUBLIC_APP_STORE_URL (Apple App Store) and NEXT_PUBLIC_PLAY_STORE_URL (Google Play).
 * Until a link is set, its badge shows as "Coming soon" instead of linking anywhere.
 */
export const appLinks = {
  appStore: process.env.NEXT_PUBLIC_APP_STORE_URL || "",
  playStore: process.env.NEXT_PUBLIC_PLAY_STORE_URL || "",
};

/** Every public page. The sitemap and llms.txt are both built from this list. */
export const publicRoutes = [
  { path: "/", label: "Home", group: "main", priority: 1, changeFrequency: "weekly", summary: "Overview of EdeBooking: discover businesses, book services and run your own business space." },
  { path: "/features", label: "Features", group: "main", priority: 0.8, changeFrequency: "monthly", summary: "Appointments, payments, daily notes and tasks, proforma invoices, receipts and portfolios." },
  { path: "/services", label: "Services", group: "main", summary: "Explore spa, wellness and other services in a visual feed.", priority: 0.8, changeFrequency: "weekly" },
  { path: "/discover", label: "Discover", group: "main", priority: 0.8, changeFrequency: "weekly", summary: "Browse local businesses by category and explore their work before booking." },
  { path: "/business", label: "For business", group: "main", priority: 0.8, changeFrequency: "monthly", summary: "How a business gets its own space: profile, portfolio, bookings, notes and records." },
  { path: "/booking", label: "Booking", group: "main", priority: 0.8, changeFrequency: "weekly", summary: "Search services, consultations, appointments, events, classes and rentals." },
  { path: "/faq", label: "FAQ", group: "main", priority: 0.6, changeFrequency: "monthly", summary: "Answers to common questions about bookings, payments, invoices and notes." },
  { path: "/contact", label: "Contact", group: "main", priority: 0.5, changeFrequency: "yearly", summary: "Get in touch about bookings, your business space or the app." },
  { path: "/privacy", label: "Privacy Policy", group: "legal", priority: 0.3, changeFrequency: "yearly", summary: "How information is collected, used, shared and protected." },
  { path: "/terms", label: "Terms of Service", group: "legal", priority: 0.3, changeFrequency: "yearly", summary: "The terms for customers and businesses using the platform." },
  { path: "/cookies", label: "Cookie Policy", group: "legal", priority: 0.3, changeFrequency: "yearly", summary: "What is stored in the browser and how to control it." },
  { path: "/data-protection", label: "Data Protection", group: "legal", summary: "Your data rights and how to make a request.", priority: 0.3, changeFrequency: "yearly" },
  { path: "/third-parties", label: "Third Parties We Use", group: "legal", summary: "External services used by EdeBooking.", priority: 0.3, changeFrequency: "yearly" },
  { path: "/acceptable-use", label: "Acceptable Use & Guidelines", group: "legal", summary: "Standards for safe and fair use.", priority: 0.3, changeFrequency: "yearly" },
] as const;

/**
 * Per-page metadata: title (the root layout adds " | EdeBooking"), description, canonical URL,
 * Open Graph and Twitter cards. The share image comes from the app-level opengraph-image.
 */
export function pageMetadata({ title, description, path, absoluteTitle }: {
  title: string;
  description: string;
  path: string;
  /** Use as the whole title, without the " | EdeBooking" suffix (for the home page). */
  absoluteTitle?: string;
}): Metadata {
  const fullTitle = absoluteTitle ?? `${title} | ${siteName}`;
  // A page-level openGraph/twitter object replaces the root one, so the share image is repeated here.
  const image = { url: "/opengraph-image", width: 1200, height: 630, alt: `${siteName}: ${siteTagline.toLowerCase()}` };
  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName, locale: "en", title: fullTitle, description, url: path, images: [image] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image.url] },
  };
}
