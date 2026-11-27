import type { Metadata } from "next";
import BookDateScreen from "@/components/dashboard/screens/BookDateScreen";

export const metadata: Metadata = { title: "Date & time" };

export default function Page() {
  return <BookDateScreen />;
}
