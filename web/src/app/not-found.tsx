import type { Metadata } from "next";
import Halftone404 from "@/components/Halftone404";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "404 — Page not found",
  description: "The page you are looking for could not be found on EdeBooking.",
};

export default function NotFound() {
  return (
    <div className="nf-page">
      <SiteNav />
      <Halftone404 />
    </div>
  );
}
