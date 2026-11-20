import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Reset your password",
  description: "Recover access to your EdeBooking account.",
  path: "/forgot-password",
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
