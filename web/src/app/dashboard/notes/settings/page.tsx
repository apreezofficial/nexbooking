import type { Metadata } from "next";
import NoteSettingsScreen from "@/components/dashboard/screens/NoteSettingsScreen";

export const metadata: Metadata = { title: "Remind me" };

export default function Page() {
  return <NoteSettingsScreen />;
}
