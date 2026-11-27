import type { Metadata } from "next";
import { Suspense } from "react";
import BookingDetailScreen from "@/components/dashboard/screens/BookingDetailScreen";

export const metadata: Metadata = { title: "Booking detail" };

export default function Page({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<div className="d-boot" aria-busy="true"><span className="d-spinner is-large" /></div>}>
      <BookingDetailScreen params={params} />
    </Suspense>
  );
}
