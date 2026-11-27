import type { Metadata } from "next";
import SearchScreen from "@/components/dashboard/screens/SearchScreen";

export const metadata: Metadata = { title: "Search" };

export default function Page() {
  return <SearchScreen />;
}
