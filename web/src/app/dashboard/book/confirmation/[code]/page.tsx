import type { Metadata } from "next";
import { Suspense } from "react";
import BookConfirmationScreen from "@/components/dashboard/screens/BookConfirmationScreen";

export const metadata: Metadata = { title: "Booking confirmed" };

export default function Page({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<div className="d-boot" aria-busy="true"><span className="d-spinner is-large" /></div>}>
      <BookConfirmationScreen params={params} />
    </Suspense>
  );
}
