import type { Metadata } from "next";
import { ReviewNewRoute } from "@/components/dashboard/screens/ReviewRoutes";

export const metadata: Metadata = { title: "Write a review" };

export default function Page() {
  return <ReviewNewRoute />;
}
