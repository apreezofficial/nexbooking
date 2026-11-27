import type { Metadata } from "next";
import BookServiceScreen from "@/components/dashboard/screens/BookServiceScreen";

export const metadata: Metadata = { title: "Choose service" };

export default function Page() {
  return <BookServiceScreen />;
}
