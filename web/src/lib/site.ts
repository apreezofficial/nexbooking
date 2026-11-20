import type { Metadata } from "next";

export const siteName = "NexBooking";
export const siteTagline = "Book, pay and manage your business in one place";
export const siteDescription =
  "Discover local businesses, book services and consultations, pay securely and run your own business space with notes, invoices and receipts in one place.";

/**
 * The public origin used for canonical links, Open Graph URLs, the sitemap and structured data.
 * Set NEXT_PUBLIC_SITE_URL (for example https://nexbooking.com) in production. On Vercel the
 * production domain is picked up automatically; locally it falls back to localhost.
 */
function resolveSiteUrl(): string {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || (vercel ? `https://${vercel}` : "http://localhost:3000");
  return origin.replace(/\/+$/, "");
}

export const siteUrl = resolveSiteUrl();

/** Every public page, used by the sitemap. */
export const publicRoutes = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/features", priority: 0.8, changeFrequency: "monthly" },
  { path: "/discover", priority: 0.8, changeFrequency: "weekly" },
  { path: "/business", priority: 0.8, changeFrequency: "monthly" },
  { path: "/booking", priority: 0.8, changeFrequency: "weekly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
] as const;

/**
 * Per-page metadata: title (the root layout adds " | NexBooking"), description, canonical URL,
 * Open Graph and Twitter cards. The share image comes from the app-level opengraph-image.
 */
export function pageMetadata({ title, description, path, absoluteTitle }: {
  title: string;
  description: string;
  path: string;
  /** Use as the whole title, without the " | NexBooking" suffix (for the home page). */
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
