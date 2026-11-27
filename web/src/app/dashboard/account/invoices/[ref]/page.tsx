import type { Metadata } from "next";
import { Suspense } from "react";
import ReceiptScreen from "@/components/dashboard/screens/ReceiptScreen";

export const metadata: Metadata = { title: "Receipt" };

export default function Page({ params }: { params: Promise<{ ref: string }> }) {
  return (
    <Suspense fallback={<div className="d-boot" aria-busy="true"><span className="d-spinner is-large" /></div>}>
      <ReceiptScreen params={params} />
    </Suspense>
  );
}
