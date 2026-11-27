import type { Metadata } from "next";
import LanguageScreen from "@/components/dashboard/screens/LanguageScreen";

export const metadata: Metadata = { title: "Language" };

export default function Page() {
  return <LanguageScreen />;
}
