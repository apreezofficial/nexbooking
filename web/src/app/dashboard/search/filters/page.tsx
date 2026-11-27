import type { Metadata } from "next";
import FiltersScreen from "@/components/dashboard/screens/FiltersScreen";

export const metadata: Metadata = { title: "Filters" };

export default function Page() {
  return <FiltersScreen />;
}
