import type { Metadata } from "next";
import { Suspense } from "react";
import CancelScreen from "@/components/dashboard/screens/CancelScreen";

export const metadata: Metadata = { title: "Cancel booking" };

export default function Page({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense fallback={<div className="d-boot" aria-busy="true"><span className="d-spinner is-large" /></div>}>
      <CancelScreen params={params} />
    </Suspense>
  );
}
