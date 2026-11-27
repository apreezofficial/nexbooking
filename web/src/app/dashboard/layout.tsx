import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import "./dashboard.css";

// The dashboard is for logged in customers: keep it out of search results.
export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | EdeBooking" },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // The shell reads the current path, which Next requires to sit under a Suspense boundary.
  return (
    <Suspense fallback={<div className="d-app"><div className="d-boot" aria-busy="true"><span className="d-spinner is-large" /></div></div>}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
