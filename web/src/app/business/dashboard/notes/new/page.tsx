import { Suspense } from "react";
import VendorDashboard from "@/components/vendor/VendorDashboard";

export const metadata = { title: "New note" };

type Props = { searchParams: Promise<{ booking?: string }> };

export default function Page(props: Props) {
  return <Suspense fallback={<p>Opening the note…</p>}><NewNote {...props} /></Suspense>;
}

async function NewNote({ searchParams }: Props) {
  const { booking } = await searchParams;
  return <VendorDashboard view="Settings" studio="NewNote" bookingId={booking} />;
}
