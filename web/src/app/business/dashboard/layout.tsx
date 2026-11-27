import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./vendor.css";

// Vendor workspace is for signed-in business owners only: keep it out of search results.
export const metadata: Metadata = {
  title: { default: "Vendor dashboard", template: "%s | EdeBooking" },
  robots: { index: false, follow: false },
};

export default function VendorDashboardLayout({ children }: { children: ReactNode }) {
  return <div className="vd-app">{children}</div>;
}
