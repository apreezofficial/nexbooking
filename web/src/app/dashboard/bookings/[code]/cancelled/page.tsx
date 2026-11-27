import type { Metadata } from "next";
import { Suspense } from "react";
import CancelledScreen from "@/components/dashboard/screens/CancelledScreen";

export const metadata: Metadata = { title: "Booking cancelled" };

export default function Page({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<div className="d-boot" aria-busy="true"><span className="d-spinner is-large" /></div>}>
      <CancelledScreen params={params} />
    </Suspense>
  );
}
