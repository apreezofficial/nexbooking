import type { Metadata } from "next";
import AccountScreen from "@/components/dashboard/screens/AccountScreen";

export const metadata: Metadata = { title: "Account" };

export default function Page() {
  return <AccountScreen />;
}
