import { Suspense } from "react";
import VendorDashboard from "@/components/vendor/VendorDashboard";

export const metadata = { title: "Edit note" };

type Props = { params: Promise<{ id: string }> };

export default function Page(props: Props) {
  return <Suspense fallback={<p>Opening the note…</p>}><EditNote {...props} /></Suspense>;
}

async function EditNote({ params }: Props) {
  const { id } = await params;
  return <VendorDashboard view="Settings" studio="NewNote" noteId={id} />;
}
