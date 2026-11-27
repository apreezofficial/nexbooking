import { Suspense } from "react";
import VendorDashboard from "@/components/vendor/VendorDashboard";

export const metadata = { title: "Workspace notes" };

type Props = { searchParams: Promise<{booking?: string}> };

export default function Page(props: Props) {
  return <Suspense fallback={<p>Opening workspace notes…</p>}><NotesPage {...props}/></Suspense>;
}

async function NotesPage({ searchParams }: Props) {
  const { booking } = await searchParams;
  return <VendorDashboard view="Settings" studio="Notes" bookingId={booking} />;
}
