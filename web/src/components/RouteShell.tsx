import type { ReactNode } from "react";
import BreadcrumbJsonLd, { type Crumb } from "@/components/BreadcrumbJsonLd";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";

export type MarketingPage = "Features" | "Discover" | "For business" | "Booking" | "FAQ";

const marketingPaths: Record<MarketingPage, string> = {
  Features: "/features",
  Discover: "/discover",
  "For business": "/business",
  Booking: "/booking",
  FAQ: "/faq",
};

/**
 * `current` highlights the nav item and also names the page in its breadcrumb schema.
 * Pages outside the main nav (contact, legal) pass `crumb` instead.
 */
export default function RouteShell({ current, crumb, children }: { current?: MarketingPage; crumb?: Crumb; children: ReactNode }) {
  const page = crumb ?? (current ? { name: current, path: marketingPaths[current] } : null);

  return (
    <main className="page route-page">
      {page ? <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, page]} /> : null}
      <div className="page-outline" aria-hidden="true" />
      <SiteNav current={current} />
      {children}
      <SiteFooter />
    </main>
  );
}
