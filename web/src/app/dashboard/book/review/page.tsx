import type { Metadata } from "next";
import BookReviewScreen from "@/components/dashboard/screens/BookReviewScreen";

export const metadata: Metadata = { title: "Review & confirm" };

export default function Page() {
  return <BookReviewScreen />;
}
