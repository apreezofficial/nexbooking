import type { Metadata } from "next";
import { Suspense } from "react";
import RescheduleScreen from "@/components/dashboard/screens/RescheduleScreen";

export const metadata: Metadata = { title: "Reschedule" };

export default function Page({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<div className="d-boot" aria-busy="true"><span className="d-spinner is-large" /></div>}>
      <RescheduleScreen params={params} />
    </Suspense>
  );
}
