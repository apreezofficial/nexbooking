import type { Metadata } from "next";
import LocationScreen from "@/components/dashboard/screens/LocationScreen";

export const metadata: Metadata = { title: "Location" };

export default function Page() {
  return <LocationScreen />;
}
