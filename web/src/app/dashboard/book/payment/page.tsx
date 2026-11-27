import type { Metadata } from "next";
import BookPaymentScreen from "@/components/dashboard/screens/BookPaymentScreen";

export const metadata: Metadata = { title: "Payment" };

export default function Page() {
  return <BookPaymentScreen />;
}
