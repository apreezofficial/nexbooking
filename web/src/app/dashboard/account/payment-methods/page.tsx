import type { Metadata } from "next";
import PaymentMethodsScreen from "@/components/dashboard/screens/PaymentMethodsScreen";

export const metadata: Metadata = { title: "Payment methods" };

export default function Page() {
  return <PaymentMethodsScreen />;
}
