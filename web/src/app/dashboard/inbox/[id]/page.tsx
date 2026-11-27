import type { Metadata } from "next";
import { Suspense } from "react";
import MessageScreen from "@/components/dashboard/screens/MessageScreen";

export const metadata: Metadata = { title: "Messages" };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="d-boot" aria-busy="true"><span className="d-spinner is-large" /></div>}>
      <MessageScreen params={params} />
    </Suspense>
  );
}
