import RouteShell from "@/components/RouteShell";
import { ServicesFeed } from "@/components/ServicesExperience";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Explore services",
  description: "Discover spa and wellness, beauty, fitness, consultations, photography and events on EdeBooking.",
  path: "/services",
});

export default function ServicesPage() {
  return <RouteShell><ServicesFeed /></RouteShell>;
}
