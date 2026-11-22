import type { Metadata } from "next";
import RouteShell from "@/components/RouteShell";
import VendorRegistrationWizard from "@/components/VendorRegistrationWizard";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Register Your Business | EdeBooking Vendor Onboarding",
  description: "Create your digital storefront on EdeBooking. Set your services, location, pricing, and operating hours to start taking appointments.",
  path: "/business/register",
});

export default function BusinessRegisterPage() {
  return (
    <RouteShell current="For business">
      <div className="vendor-reg-page-hero">
        <p className="eyebrow">YOUR BUSINESS, YOUR SPACE</p>
        <h1 className="section-title">Open your business space on EdeBooking.</h1>
        <p className="section-sub">
          Set up your storefront in minutes. Showcase your services, receive bookings with clear grace-period policies, and manage client payments seamlessly.
        </p>
      </div>
      <section className="route-content vendor-wizard-section">
        <VendorRegistrationWizard />
      </section>
    </RouteShell>
  );
}
