import type { Metadata } from "next";
import VoiceNoteScreen from "@/components/dashboard/screens/VoiceNoteScreen";

export const metadata: Metadata = { title: "Voice note" };

export default function Page() {
  return <VoiceNoteScreen />;
}
