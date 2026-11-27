import type { Metadata } from "next";
import PrivacyScreen from "@/components/dashboard/screens/PrivacyScreen";

export const metadata: Metadata = { title: "Privacy & security" };

export default function Page() {
  return <PrivacyScreen />;
}
