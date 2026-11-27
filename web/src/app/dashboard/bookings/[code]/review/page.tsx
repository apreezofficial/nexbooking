import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingReviewRoute } from "@/components/dashboard/screens/ReviewRoutes";

export const metadata: Metadata = { title: "Submit review" };

export default function Page({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<div className="d-boot" aria-busy="true"><span className="d-spinner is-large" /></div>}>
      <BookingReviewRoute params={params} />
    </Suspense>
  );
}
