import type { Metadata } from "next";
import NotificationPrefsScreen from "@/components/dashboard/screens/NotificationPrefsScreen";

export const metadata: Metadata = { title: "Notification preferences" };

export default function Page() {
  return <NotificationPrefsScreen />;
}
