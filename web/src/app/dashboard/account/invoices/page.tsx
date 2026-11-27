import type { Metadata } from "next";
import InvoicesScreen from "@/components/dashboard/screens/InvoicesScreen";

export const metadata: Metadata = { title: "Invoices & receipts" };

export default function Page() {
  return <InvoicesScreen />;
}
