"use client";

import Link from "next/link";
import BrandLogo from "./BrandLogo";
import VendorRegistrationWizard from "./VendorRegistrationWizard";
import { parseSession, useSessionRaw } from "@/lib/session";

export default function VendorOnboarding() {
  const raw = useSessionRaw();
  if (raw === null) return null;
  if (parseSession(raw)?.role !== "vendor") {
    return <main className="route-content vendor-wizard-section">
      <BrandLogo />
      <h1>Create a vendor account to set up your business</h1>
      <Link href="/business/signup" className="btn btn-gradient">Vendor signup</Link>
    </main>;
  }

  return <main className="route-content vendor-wizard-section">
    <BrandLogo />
    <VendorRegistrationWizard />
  </main>;
}
