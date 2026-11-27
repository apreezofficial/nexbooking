import type { Metadata } from "next";
import NewNoteScreen from "@/components/dashboard/screens/NewNoteScreen";

export const metadata: Metadata = { title: "New note" };

export default function Page() {
  return <NewNoteScreen />;
}
