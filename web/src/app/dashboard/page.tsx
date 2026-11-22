import RouteShell from "@/components/RouteShell";
import DashboardView from "@/components/DashboardView";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({ title: "Dashboard", description: "Your EdeBooking bookings and saved details.", path: "/dashboard" });

export default function DashboardPage() {
  return <RouteShell><DashboardView /></RouteShell>;
}
