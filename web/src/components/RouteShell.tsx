import type { ReactNode } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";

export type MarketingPage = "Features" | "Discover" | "For business" | "Booking" | "FAQ";

export default function RouteShell({ current, children }: { current?: MarketingPage; children: ReactNode }) {
  return (
    <main className="page route-page">
      <div className="page-outline" aria-hidden="true" />
      <SiteNav current={current} />
      {children}
      <SiteFooter />
    </main>
  );
}
