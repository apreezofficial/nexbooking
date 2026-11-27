import type { Metadata } from "next";
import ReviewsScreen from "@/components/dashboard/screens/ReviewsScreen";

export const metadata: Metadata = { title: "My reviews" };

export default function Page() {
  return <ReviewsScreen />;
}
