import type { Metadata } from "next";
import ExploreScreen from "@/components/dashboard/screens/ExploreScreen";

export const metadata: Metadata = { title: "Explore" };

export default function Page() {
  return <ExploreScreen />;
}
