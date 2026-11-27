import type { Metadata } from "next";
import { Suspense } from "react";
import StorefrontScreen from "@/components/dashboard/screens/StorefrontScreen";

export const metadata: Metadata = { title: "Studio" };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="d-boot" aria-busy="true"><span className="d-spinner is-large" /></div>}>
      <StorefrontScreen params={params} />
    </Suspense>
  );
}
