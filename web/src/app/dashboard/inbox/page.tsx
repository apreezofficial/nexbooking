import type { Metadata } from "next";
import InboxScreen from "@/components/dashboard/screens/InboxScreen";

export const metadata: Metadata = { title: "Inbox" };

export default function Page() {
  return <InboxScreen />;
}
