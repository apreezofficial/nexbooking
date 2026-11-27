import type { Metadata } from "next";
import ScheduleScreen from "@/components/dashboard/screens/ScheduleScreen";

export const metadata: Metadata = { title: "Schedule" };

export default function Page() {
  return <ScheduleScreen />;
}
