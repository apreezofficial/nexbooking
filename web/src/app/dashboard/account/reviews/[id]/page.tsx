import type { Metadata } from "next";
import { Suspense } from "react";
import { ReviewEditRoute } from "@/components/dashboard/screens/ReviewRoutes";

export const metadata: Metadata = { title: "Edit review" };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="d-boot" aria-busy="true"><span className="d-spinner is-large" /></div>}>
      <ReviewEditRoute params={params} />
    </Suspense>
  );
}
